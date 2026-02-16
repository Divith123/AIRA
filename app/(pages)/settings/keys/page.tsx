"use client";

import React, { useState } from "react";
// DashboardLayout removed
import Header from "../../../components/Header";
import { Button } from "../../../../components/ui/Button";
import { Modal } from "../../../../components/ui/Modal";
import { Card } from "../../../../components/ui/Card";
import { Search, Copy, Trash2, Check, Info, ExternalLink } from "lucide-react";
import { getApiKeys, createApiKey, deleteApiKey, getMe, ApiKey } from "../../../../lib/api";

interface ApiKeysPageProps {
  projectId?: string;
}

export default function ApiKeysPage({ projectId }: ApiKeysPageProps) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"own" | "other">("own");
  const [showCreate, setShowCreate] = useState(false);
  const [keyDescription, setKeyDescription] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const [me, setMe] = useState<any>(null);

  React.useEffect(() => {
    loadKeys();
    getMe().then(setMe).catch(console.error);
  }, [projectId]);

  const loadKeys = async () => {
    try {
      setIsLoading(true);
      const data = await getApiKeys(projectId);
      setKeys(data);
    } catch (error) {
      console.error("Failed to load keys:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const ownKeys = keys;
  const otherKeys: ApiKey[] = [];
  const displayKeys = activeTab === "own" ? ownKeys : otherKeys;

  const filteredKeys = displayKeys.filter(
    (k) =>
      k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.key_prefix?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerateKey = async () => {
    if (!keyDescription.trim()) return;

    try {
      const resp = await createApiKey(keyDescription, projectId);
      // Backend returns ApiKey with secret only on create
      setGeneratedKey((resp as any).secret || (resp as any).secret_key || "Key created hidden");
      await loadKeys();
    } catch (error) {
      alert("Failed to generate key");
    }
  };

  const handleCopyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this API key?")) {
      try {
        await deleteApiKey(id, projectId);
        await loadKeys();
      } catch (error) {
        alert("Failed to delete API key");
      }
    }
  };

  return (
    <>
      <Header
        projectName="Default Project"
        pageName="Keys"
        showTimeRange={false}
        actionButton={
          <Button onClick={() => setShowCreate(true)}>Create key</Button>
        }
      />

      <div className="p-4 md:p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-2">API keys</h2>
              <p className="text-muted-foreground">Manage project access keys.</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between border-b border-border/40 mb-4">
                <div className="flex gap-6">
              <button
                onClick={() => setActiveTab("own")}
                className={`pb-3 px-1 font-medium text-sm transition-colors ${activeTab === "own"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Your API keys
              </button>
              <button
                onClick={() => setActiveTab("other")}
                className={`pb-3 px-1 font-medium text-sm transition-colors ${activeTab === "other"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Other API keys
              </button>
            </div>
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-muted/20 border border-border/40 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

          <div className="rounded-lg border border-border/40 bg-white dark:bg-surface/30 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40 bg-gray-50 dark:bg-muted/20">
                <th className="text-left px-6 py-4 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  Description
                </th>
                <th className="text-left px-6 py-4 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  API Key
                </th>
                <th className="text-left px-6 py-4 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  Issued On
                </th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                  </td>
                </tr>
              ) : filteredKeys.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="text-muted-foreground">
                      {activeTab === "own"
                        ? "No API keys yet. Create one to get started."
                        : "No other API keys to display."}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredKeys.map((key) => (
                  <tr
                    key={key.id}
                    className="hover:bg-gray-50 dark:hover:bg-muted/10 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-foreground font-medium">
                      {key.name}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                      {key.key_prefix}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {key.created_at}
                    </td>
                    <td className="px-6 py-4">
                      {activeTab === "own" && (
                        <button
                          onClick={() => handleDelete(key.id)}
                          className="p-2 rounded-lg text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Delete API key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-5 border-border/60 bg-linear-to-br from-white to-gray-50/50 dark:from-surface/40 dark:to-surface/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Info className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">API Key Guide</h3>
              </div>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground leading-relaxed">
                  Keys allow your backend servers to communicate with LiveKit. Keep them secret and rotate them if compromised.
                </div>
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[12px] text-amber-600 dark:text-amber-400">
                  <strong>Security Note:</strong> Keys are only displayed once upon creation.
                </div>
              </div>
            </Card>

            <Card className="p-5 border-border/60 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-4">API Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-border/30 pb-2">
                  <span className="text-muted-foreground">Active Keys</span>
                  <span className="font-mono font-medium text-foreground">{keys.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-border/30 pb-2">
                  <span className="text-muted-foreground">Last Created</span>
                  <span className="text-foreground">{keys[0]?.created_at || "Never"}</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 border-border/60">
              <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wider mb-4">Developer Resources</h3>
              <div className="space-y-3">
                <a href="#" className="flex items-center justify-between group p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground group-hover:text-primary">Authentication docs</span>
                  </div>
                </a>
                <a href="#" className="flex items-center justify-between group p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground group-hover:text-primary">SDK Integration</span>
                  </div>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showCreate}
        onClose={() => {
          setShowCreate(false);
          setGeneratedKey(null);
          setKeyDescription("");
        }}
        title="Create new API key"
        footer={
          generatedKey ? (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCreate(false);
                  setGeneratedKey(null);
                  setKeyDescription("");
                }}
              >
                Done
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCreate(false);
                  setKeyDescription("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateKey}
                disabled={!keyDescription.trim()}
              >
                Generate key
              </Button>
            </div>
          )
        }
      >
        {!generatedKey ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add a description to your key. This will help you identify it later.
            </p>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Key description
              </label>
              <input
                type="text"
                value={keyDescription}
                onChange={(e) => setKeyDescription(e.target.value)}
                placeholder="Key for iOS client"
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  keyDescription.trim() &&
                  handleGenerateKey()
                }
                autoFocus
                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-muted/20 border border-border/60 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-400 font-medium mb-3">
                API key created successfully
              </p>
              <p className="text-xs text-green-700 dark:text-green-500 mb-3">
                Copy this key now. You won't be able to see it again.
              </p>

              <div className="bg-white dark:bg-muted/20 rounded-lg p-3 font-mono text-xs text-foreground break-all border border-border/40 mb-3">
                {generatedKey}
              </div>

              <Button
                size="sm"
                variant={copied ? "ghost" : "outline"}
                onClick={handleCopyKey}
                className="w-full flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy to clipboard
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
