import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/hooks/useTheme";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useLLMProviderStore } from "@/stores/useLLMProviderStore";
import type { ProviderType } from "@/lib/llm/types";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme();
  const { loadSettings, dataforseoApiKey, wordpressUrl, wordpressUsername, wordpressAppPassword, setApiKey, setWordPress, isLoading } = useSettingsStore();

  const [activeTab, setActiveTab] = useState("api-keys");

  // API Keys state
  const [dataforseoKeyInput, setDataforseoKeyInput] = useState("");

  // WordPress state
  const [wpUrlInput, setWpUrlInput] = useState("");
  const [wpUsernameInput, setWpUsernameInput] = useState("");
  const [wpPasswordInput, setWpPasswordInput] = useState("");

  // LLM state
  const [llmProvider, setLlmProvider] = useState<ProviderType>('deepseek');
  const [llmKeyInput, setLlmKeyInput] = useState('');
  const [llmBaseUrlInput, setLlmBaseUrlInput] = useState('');
  const [showLlmKey, setShowLlmKey] = useState(false);
  const [llmModelInput, setLlmModelInput] = useState('deepseek-chat');
  const [llmTempInput, setLlmTempInput] = useState(0.7);
  const [llmMaxTokensInput, setLlmMaxTokensInput] = useState(4096);

  const { loadConfig: loadLlmConfig, setApiKey: setLlmApiKey, setBaseURL: setLlmBaseUrl, setModel: setLlmModel, setTemperature: setLlmTemperature, setMaxTokens: setLlmMaxTokens, provider: currentProvider } = useLLMProviderStore();

  useEffect(() => {
    if (open) {
      loadSettings();
      loadLlmConfig();
    }
  }, [open, loadSettings, loadLlmConfig]);

  useEffect(() => {
    if (!isLoading) {
      setDataforseoKeyInput(dataforseoApiKey || "");
      setWpUrlInput(wordpressUrl || "");
      setWpUsernameInput(wordpressUsername || "");
      setWpPasswordInput(wordpressAppPassword || "");
    }
  }, [isLoading, dataforseoApiKey, wordpressUrl, wordpressUsername, wordpressAppPassword]);

  useEffect(() => {
    setLlmProvider(currentProvider);
  }, [currentProvider]);

  const handleSaveApiKeys = async () => {
    try {
      if (!dataforseoKeyInput.trim()) {
        toast.error("请填写 DataForSEO API 密钥");
        return;
      }
      await setApiKey("dataforseo", dataforseoKeyInput.trim());
      toast.success("API 密钥已保存");
    } catch {
      toast.error("保存失败");
    }
  };

  const handleSaveWordPress = async () => {
    try {
      if (!wpUrlInput.trim() || !wpUsernameInput.trim() || !wpPasswordInput.trim()) {
        toast.error("请填写完整的 WordPress 配置信息");
        return;
      }
      await setWordPress(wpUrlInput.trim(), wpUsernameInput.trim(), wpPasswordInput.trim());
      toast.success("WordPress 配置已保存");
    } catch (error) {
      toast.error("保存失败");
    }
  };

  const handleTestConnection = async () => {
    try {
      toast.promise(
        invoke<boolean>("test_wordpress_connection"),
        {
          loading: "正在测试连接...",
          success: () => {
            return "连接成功";
          },
          error: (err) => {
            return `连接失败: ${err}`;
          }
        }
      );
    } catch (error) {
      toast.error("连接失败");
    }
  };

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  const handleSaveLlmConfig = async () => {
    if (!llmKeyInput.trim()) {
      toast.error('请输入 API 密钥');
      return;
    }
    await setLlmApiKey(llmKeyInput.trim());
    if (llmProvider === 'openai-compat' && llmBaseUrlInput.trim()) {
      await setLlmBaseUrl(llmBaseUrlInput.trim());
    }
    toast.success('LLM 配置已保存');
  };

  const handleSaveLlmParams = async () => {
    await setLlmModel(llmModelInput);
    await setLlmTemperature(llmTempInput);
    await setLlmMaxTokens(llmMaxTokensInput);
    toast.success('模型参数已保存');
  };

  const handleLlmProviderChange = (v: string | null) => {
    if (!v) return;
    const provider = v as ProviderType;
    setLlmProvider(provider);
    if (provider === 'deepseek') {
      setLlmModelInput('deepseek-chat');
      setLlmBaseUrlInput('');
    } else {
      setLlmModelInput('gpt-4o-mini');
      setLlmBaseUrlInput('https://api.siliconflow.cn/v1');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>设置</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="api-keys" className="flex-1">API 密钥</TabsTrigger>
              <TabsTrigger value="llm" className="flex-1">LLM</TabsTrigger>
              <TabsTrigger value="wordpress" className="flex-1">WordPress</TabsTrigger>
              <TabsTrigger value="appearance" className="flex-1">外观</TabsTrigger>
            </TabsList>

            <TabsContent value="api-keys" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>研究 API 密钥</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">DataForSEO API 密钥</label>
                    <p className="text-xs text-slate-500 mb-1">用于 SEO 研究功能（关键词分析、竞品分析等）</p>
                    <Input
                      type="password"
                      value={dataforseoKeyInput}
                      onChange={(e) => setDataforseoKeyInput(e.target.value)}
                      placeholder="..."
                      className="mt-1"
                    />
                  </div>

                  <Button onClick={handleSaveApiKeys} className="w-full">
                    保存
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="llm" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>LLM 提供商</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">提供商</label>
                    <Select
                      value={llmProvider}
                      onValueChange={handleLlmProviderChange}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deepseek">DeepSeek</SelectItem>
                        <SelectItem value="openai-compat">OpenAI 兼容</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      {llmProvider === 'deepseek' ? 'DeepSeek' : 'OpenAI 兼容'} API 密钥
                    </label>
                    <div className="relative mt-1">
                      <Input
                        type={showLlmKey ? "text" : "password"}
                        value={llmKeyInput}
                        onChange={(e) => setLlmKeyInput(e.target.value)}
                        placeholder={llmProvider === 'deepseek' ? "sk-..." : "sk-..."}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLlmKey(!showLlmKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-sm"
                      >
                        {showLlmKey ? "隐藏" : "显示"}
                      </button>
                    </div>
                  </div>

                  {llmProvider === 'openai-compat' && (
                    <div>
                      <label className="text-sm font-medium">API Base URL</label>
                      <Input
                        type="url"
                        value={llmBaseUrlInput}
                        onChange={(e) => setLlmBaseUrlInput(e.target.value)}
                        placeholder="https://api.siliconflow.cn/v1"
                        className="mt-1"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        如果 URL 末尾缺少 /v1，将自动添加
                      </p>
                    </div>
                  )}

                  <Button onClick={handleSaveLlmConfig} className="w-full">
                    保存配置
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>模型参数</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">模型</label>
                    <Input
                      value={llmModelInput}
                      onChange={(e) => setLlmModelInput(e.target.value)}
                      placeholder={llmProvider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini'}
                      className="mt-1"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {llmProvider === 'deepseek' ? '默认: deepseek-chat' : '例如: gpt-4o-mini, gpt-4o'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Temperature: {llmTempInput}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={llmTempInput}
                      onChange={(e) => setLlmTempInput(parseFloat(e.target.value))}
                      className="w-full mt-1"
                    />
                    <p className="text-xs text-slate-500">
                      Lower = more focused, Higher = more creative (默认: 0.7)
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Max Tokens: {llmMaxTokensInput}
                    </label>
                    <Input
                      type="number"
                      value={llmMaxTokensInput}
                      onChange={(e) => setLlmMaxTokensInput(parseInt(e.target.value) || 4096)}
                      min={100}
                      max={32000}
                      className="mt-1"
                    />
                    <p className="text-xs text-slate-500">
                      最大生成 token 数 (默认: 4096)
                    </p>
                  </div>

                  <Button onClick={handleSaveLlmParams} variant="outline" className="w-full">
                    保存参数
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wordpress" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>WordPress 配置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">WordPress 地址</label>
                    <Input
                      type="url"
                      value={wpUrlInput}
                      onChange={(e) => setWpUrlInput(e.target.value)}
                      placeholder="https://yoursite.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">用户名</label>
                    <Input
                      value={wpUsernameInput}
                      onChange={(e) => setWpUsernameInput(e.target.value)}
                      placeholder="username"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">应用密码</label>
                    <Input
                      type="password"
                      value={wpPasswordInput}
                      onChange={(e) => setWpPasswordInput(e.target.value)}
                      placeholder="xxxx xxxx xxxx xxxx"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveWordPress} className="flex-1">
                      保存
                    </Button>
                    <Button variant="outline" onClick={handleTestConnection} className="flex-1">
                      测试连接
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>外观设置</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">深色模式</label>
                      <p className="text-sm text-slate-500">切换深色/浅色主题</p>
                    </div>
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={handleThemeToggle}
                    />
                  </div>
                  <p className="text-sm text-slate-500 mt-4">
                    当前主题: {theme === "dark" ? "深色" : "浅色"}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}