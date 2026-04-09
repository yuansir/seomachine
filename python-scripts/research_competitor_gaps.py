#!/usr/bin/env python3
"""
Research Competitor Gap Analysis

Analyzes keyword gaps between target site and competitors using DataForSEO.
When DataForSEO credentials are not configured, returns analysis based on keywords.

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


def fetch_keyword_ideas(keywords, login, password):
    """Use Keywords For Site or keyword suggestions to find related terms."""
    payload = [{
        "keywords": keywords,
        "location_code": 2840,
        "language_code": "en",
        "limit": 20,
    }]
    try:
        data = dataforseo_request(
            "dataforseo_labs/google/keyword_ideas/live", payload, login, password
        )
        results = []
        for task in data.get("tasks", []):
            for result in task.get("result", []) or []:
                for item in result.get("items", []) or []:
                    kw_data = item.get("keyword_info", {}) or {}
                    kw = item.get("keyword", "")
                    if not kw:
                        continue
                    volume = kw_data.get("search_volume") or 0
                    diff = int(kw_data.get("competition_index") or 0)
                    opps = []
                    if diff < 30:
                        opps.append("低竞争度关键词，竞争对手覆盖薄弱")
                    if volume > 500:
                        opps.append("搜索量有潜力，值得优先布局")
                    opps.append("创建专门针对此词的落地页或博客文章")
                    opps.append("在竞争对手未覆盖的角度撰写内容")
                    results.append({
                        "keyword": kw,
                        "volume": volume,
                        "difficulty": diff,
                        "opportunities": opps,
                    })
        return results
    except Exception as e:
        print(f"[DataForSEO] keyword ideas failed: {e}", file=sys.stderr)
        return []


def fetch_competitor_urls(keywords, login, password):
    """Fetch SERP results for the first keyword to identify competitors."""
    if not keywords:
        return []
    payload = [{
        "keyword": keywords[0],
        "location_code": 2840,
        "language_code": "en",
        "depth": 10,
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
                "竞争对手可能未深度覆盖此词，可撰写更详尽的内容",
                "针对此词创建专题页面，提升主题权威性",
                "通过内链建设提升此词相关页面的权重",
                "分析竞争对手内容，找到内容差异化切入点",
            ],
        })
    return results


def build_content_suggestions(keywords):
    suggestions = []
    for kw in keywords[:5]:
        suggestions.append({
            "title": f"竞争对手不知道的 {kw.title()} 技巧：差异化策略完全指南",
            "metaDescription": (
                f"深度分析 {kw} 竞争格局，找到你的差异化机会。"
                "实战策略帮你超越竞争对手。"
            ),
            "mainTopics": [
                f"{kw} 竞争对手分析",
                "内容差距识别",
                "差异化定位策略",
                "快速切入竞争对手薄弱点",
                "ROI 优先级排序",
            ],
            "wordCount": 2000,
        })
        suggestions.append({
            "title": f"{kw.title()} vs 竞品：2025 年全面对比分析",
            "metaDescription": (
                f"横向对比 {kw} 领域的竞品，发现市场空白。"
                "数据驱动的竞争分析报告。"
            ),
            "mainTopics": [
                "市场格局概述",
                f"{kw} 竞品关键词覆盖分析",
                "内容空白机会",
                "执行计划",
            ],
            "wordCount": 1800,
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
        keyword_data = fetch_keyword_ideas(keywords, login, password)
        competitor_urls = fetch_competitor_urls(keywords, login, password)
        if keyword_data:
            avg_diff = sum(k["difficulty"] for k in keyword_data) / len(keyword_data)
            seo_score = max(10, 100 - int(avg_diff))

    if not keyword_data:
        keyword_data = estimate_keyword_data(keywords)
        seo_score = 60

    print(json.dumps({
        "keywords": keyword_data,
        "content_suggestions": build_content_suggestions(keywords),
        "seo_score": seo_score,
        "top_competitors": competitor_urls,
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
