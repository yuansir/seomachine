import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useTheme } from "@/hooks/useTheme";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme();
  const { loadSettings, claudeApiKey, dataforseoApiKey, wordpressUrl, wordpressUsername, wordpressAppPassword, setApiKey, setWordPress, isLoading } = useSettingsStore();

  const [activeTab, setActiveTab] = useState("api-keys");

  // API Keys state
  const [claudeKeyInput, setClaudeKeyInput] = useState("");
  const [dataforseoKeyInput, setDataforseoKeyInput] = useState("");
  const [showClaudeKey, setShowClaudeKey] = useState(false);

  // WordPress state
  const [wpUrlInput, setWpUrlInput] = useState("");
  const [wpUsernameInput, setWpUsernameInput] = useState("");
  const [wpPasswordInput, setWpPasswordInput] = useState("");

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open, loadSettings]);

  useEffect(() => {
    if (!isLoading) {
      setClaudeKeyInput(claudeApiKey || "");
      setDataforseoKeyInput(dataforseoApiKey || "");
      setWpUrlInput(wordpressUrl || "");
      setWpUsernameInput(wordpressUsername || "");
      setWpPasswordInput(wordpressAppPassword || "");
    }
  }, [isLoading, claudeApiKey, dataforseoApiKey, wordpressUrl, wordpressUsername, wordpressAppPassword]);

  const handleSaveApiKeys = async () => {
    try {
      if (claudeKeyInput) {
        await setApiKey("claude", claudeKeyInput);
      }
      if (dataforseoKeyInput) {
        await setApiKey("dataforseo", dataforseoKeyInput);
      }
      toast.success("API 密钥已保存");
    } catch (error) {
      toast.error("保存失败");
    }
  };

  const handleSaveWordPress = async () => {
    try {
      await setWordPress(wpUrlInput, wpUsernameInput, wpPasswordInput);
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
              <TabsTrigger value="wordpress" className="flex-1">WordPress</TabsTrigger>
              <TabsTrigger value="appearance" className="flex-1">外观</TabsTrigger>
            </TabsList>

            <TabsContent value="api-keys" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>API 密钥</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Claude API 密钥</label>
                    <div className="relative mt-1">
                      <Input
                        type={showClaudeKey ? "text" : "password"}
                        value={claudeKeyInput}
                        onChange={(e) => setClaudeKeyInput(e.target.value)}
                        placeholder="sk-..."
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowClaudeKey(!showClaudeKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-sm"
                      >
                        {showClaudeKey ? "隐藏" : "显示"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">DataForSEO API 密钥</label>
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