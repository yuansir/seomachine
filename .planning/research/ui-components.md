# UI 组件库选型研究

## 候选方案

### 1. shadcn/ui + TailwindCSS (推荐)

**组件**:
- Button, Input, Textarea, Select
- Card, Dialog, Sheet (侧边栏)
- Table, Tabs
- Badge, Avatar
- Form 组件 (with React Hook Form)

**优点**:
- 基于 Radix UI，无障碍支持好
- 样式完全可定制
- 不增加包体积（复制粘贴模式）
- 与 TailwindCSS 4.x 配合良好

**缺点**:
- 需要手动复制组件代码
- 不是传统意义的"安装即用"

### 2. Material UI (MUI)

**优点**:
- 组件丰富
- 文档完善
- 主题系统强大

**缺点**:
- 包体积大
- 默认样式偏企业化
- 定制需要覆盖样式

### 3. Ant Design

**优点**:
- 组件非常丰富
- 企业级品质

**缺点**:
- 包体积大
- 样式固定，定制困难
- 不够"现代化"

## 推荐方案

**shadcn/ui + TailwindCSS**

理由：
1. 符合项目的简洁文档风格需求
2. 可定制性强，能实现深色主题
3. 无障碍支持好
4. 包体积小
5. 与 Zustand 配合良好

## 关键组件清单

### 导航
- [ ] Sidebar - 左侧导航
- [ ] Tabs - 内容区域切换

### 表单
- [ ] Input - 文本输入
- [ ] Textarea - 多行文本
- [ ] Select - 下拉选择
- [ ] Button - 按钮
- [ ] Switch - 开关（设置页面）

### 数据展示
- [ ] Card - 卡片（研究结果、文章列表）
- [ ] Table - 表格（文章列表）
- [ ] Badge - 标签
- [ ] Progress - 进度条

### 反馈
- [ ] Dialog - 确认对话框
- [ ] Toast - 操作反馈
- [ ] Skeleton - 加载骨架屏

### 编辑器
- [ ] Markdown Editor - 使用 @uiw/react-md-editor 或 react-markdown
- [ ] Markdown Preview - 实时预览

## 深色主题实现

使用 TailwindCSS 的 dark mode：
```tsx
<div className="bg-white dark:bg-gray-900">
  <h1 className="text-gray-900 dark:text-white">标题</h1>
</div>
```

shadcn/ui 支持 dark mode：
```tsx
<Button className="dark:bg-gray-800">按钮</Button>
```

## 参考资料

- [shadcn/ui](https://ui.shadcn.com/)
- [TailwindCSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [Radix UI Primitives](https://www.radix-ui.com/)
