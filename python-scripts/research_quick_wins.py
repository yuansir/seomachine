#!/usr/bin/env python3
"""
Research Quick Win Opportunities

Identifies quick-win keyword opportunities using DataForSEO API.
When DataForSEO credentials are not configured, returns keyword analysis based
on the input keywords themselves.

Output: JSON to stdout in the format expected by SEO Machine frontend.
"""

import os
import sys
import json
import argparse
import requests
from base64 import b64encode


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--keywords", action="append", default=[],
                        help="Keyword to research (repeat for multiple)")
    return parser.parse_args()


def get_credentials():
    """Return (login, password) tuple or None."""
    login = os.getenv("DATAFORSEO_LOGIN")
    password = os.getenv("DATAFORSEO_PASSWORD")
    if login and password:
        return login, password
    combo = os.getenv("DATAFORSEO_API_KEY", "")
    if ":" in combo:
        parts = combo.split(":", 1)
        return parts[0], parts[1]
    return None


def dataforseo_request(endpoint, payload, login, password):
    token = b64encode(f"{login}:{password}".encode()).decode()
    headers = {
        "Authorization": f"Basic {token}",
        "Content-Type": "application/json",
    }
    url = f"https://api.dataforseo.com/v3/{endpoint}"
    r = requests.post(url, headers=headers, json=payload, timeout=30)
    r.raise_for_status()
    return r.json()


def fetch_keyword_data(keywords, login, password):
    payload = [{
        "keywords": keywords,
        "location_code": 2840,
        "language_code": "en",
    }]
    try:
        data = dataforseo_request(
            "keywords_data/google_ads/search_volume/live", payload, login, password
        )
        results = []
        for task in data.get("tasks", []):
            for item in task.get("result", []) or []:
                word_count = len(item.get("keyword", "").split())
                is_long_tail = word_count >= 3
                opps = []
                if is_long_tail:
                    opps.append("长尾词：意图明确，转化率高")
                if (item.get("competition_index") or 0) < 40:
                    opps.append("竞争度低，易于排名")
                if (item.get("search_volume") or 0) > 1000:
                    opps.append("搜索量较高，值得优先布局")
                opps.append("优化 title/H1 标签")
                opps.append("增加内链指向此关键词页面")
                results.append({
                    "keyword": item.get("keyword", ""),
                    "volume": item.get("search_volume") or 0,
                    "difficulty": int(item.get("competition_index") or 0),
                    "opportunities": opps,
                })
        return results
    except Exception as e:
        print(f"[DataForSEO] keyword fetch failed: {e}", file=sys.stderr)
        return []


def fetch_serp_competitors(keyword, login, password):
    payload = [{
        "keyword": keyword,
        "location_code": 2840,
        "language_code": "en",
        "depth": 5,
    }]
    try:
        data = dataforseo_request(
            "serp/google/organic/live/regular", payload, login, password
        )
        urls = []
        for task in data.get("tasks", []):
            for result in task.get("result", []) or []:
                for item in result.get("items", []) or []:
                    if item.get("type") == "organic":
                        url = item.get("url", "")
                        if url:
                            urls.append(url)
        return urls[:5]
    except Exception as e:
        print(f"[DataForSEO] SERP fetch failed: {e}", file=sys.stderr)
        return []


def estimate_keyword_data(keywords):
    results = []
    for kw in keywords:
        word_count = len(kw.split())
        difficulty = max(10, 70 - word_count * 10)
        results.append({
            "keyword": kw,
            "volume": 0,
            "difficulty": difficulty,
            "opportunities": [
                "优化 title/H1 标签，精确包含关键词",
                "增加内链指向此关键词页面",
                "完善 meta description，提升点击率",
                "检查页面加载速度，提升用户体验",
            ],
        })
    return results


def build_content_suggestions(keywords):
    suggestions = []
    for kw in keywords[:5]:
        suggestions.append({
            "title": f"{kw.title()} 完整指南：最佳实践与操作技巧",
            "metaDescription": (
                f"深入了解 {kw} 的核心知识。"
                "专家建议、最佳实践和可执行策略，帮助你快速提升效果。"
            ),
            "mainTopics": [
                f"什么是 {kw}？",
                f"为什么 {kw} 很重要",
                f"{kw} 的最佳实践",
                f"避免 {kw} 常见错误",
                f"如何衡量 {kw} 的成效",
            ],
            "wordCount": 1500,
        })
        suggestions.append({
            "title": f"2025 年 {kw.title()} 优化策略：经过验证的实用方法",
            "metaDescription": (
                f"学习行业领军者使用的顶级 {kw} 策略。"
                "附真实案例的分步指南。"
            ),
            "mainTopics": [
                f"核心 {kw} 策略",
                "案例分析",
                f"{kw} 实用工具",
                "ROI 测量方法",
            ],
            "wordCount": 1200,
        })
    return suggestions[:6]


def main():
    args = parse_args()
    if not args.keywords:
        print(json.dumps({"error": "No keywords provided. Use --keywords <keyword>"}))
        sys.exit(1)

    keywords = args.keywords
    creds = get_credentials()

    keyword_data = []
    competitor_urls = []
    seo_score = 0

    if creds:
        login, password = creds
        keyword_data = fetch_keyword_data(keywords, login, password)
        if keywords:
            competitor_urls = fetch_serp_competitors(keywords[0], login, password)
        if keyword_data:
            avg_diff = sum(k["difficulty"] for k in keyword_data) / len(keyword_data)
            seo_score = max(10, 100 - int(avg_diff))

    if not keyword_data:
        keyword_data = estimate_keyword_data(keywords)
        seo_score = 55

    print(json.dumps({
        "keywords": keyword_data,
        "content_suggestions": build_content_suggestions(keywords),
        "seo_score": seo_score,
        "top_competitors": competitor_urls,
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
