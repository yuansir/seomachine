import { LucideIcon, Search, FileText, BarChart3, FileSearch } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center p-8 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </Card>
  );
}

// Pre-built empty states for specific use cases

interface EmptyResearchProps {
  onAction?: () => void;
}

export function EmptyResearch({ onAction }: EmptyResearchProps) {
  return (
    <EmptyState
      icon={Search}
      title="开始主题研究"
      description="输入关键词，获取 SEO 优化建议和内容灵感"
      action={onAction ? { label: "开始研究", onClick: onAction } : undefined}
    />
  );
}

interface EmptyArticleProps {
  onAction?: () => void;
}

export function EmptyArticle({ onAction }: EmptyArticleProps) {
  return (
    <EmptyState
      icon={FileText}
      title="撰写新文章"
      description="基于研究简报生成 SEO 优化内容"
      action={onAction ? { label: "开始撰写", onClick: onAction } : undefined}
    />
  );
}

interface EmptyAnalysisProps {
  onAction?: () => void;
}

export function EmptyAnalysis({ onAction }: EmptyAnalysisProps) {
  return (
    <EmptyState
      icon={BarChart3}
      title="开始 SEO 分析"
      description="选择文章并分析其 SEO 表现，获取优化建议"
      action={onAction ? { label: "开始分析", onClick: onAction } : undefined}
    />
  );
}

interface EmptySearchProps {
  message?: string;
}

export function EmptySearch({ message = "没有找到结果" }: EmptySearchProps) {
  return (
    <EmptyState
      icon={FileSearch}
      title="没有找到结果"
      description={message}
    />
  );
}
