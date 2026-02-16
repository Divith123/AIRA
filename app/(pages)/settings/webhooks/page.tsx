"use client";

import React, { useState } from "react";
// DashboardLayout removed
import Header from "../../../components/Header";
import { Button } from "../../../../components/ui/Button";
import { Modal } from "../../../../components/ui/Modal";
import { Card } from "../../../../components/ui/Card";
import { Globe, Trash2, ExternalLink, Copy, Check } from "lucide-react";
import { getWebhooks, createWebhook, deleteWebhook, getApiKeys, Webhook, ApiKey } from "../../../../lib/api";

interface WebhooksPageProps {
  projectId?: string;
}

export default function WebhooksPage({ projectId }: WebhooksPageProps) {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    signingKey: "",
  });
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  React.useEffect(() => {
    loadWebhooks();
    getApiKeys(projectId).then(setApiKeys).catch(console.error);
  }, [projectId]);

  const loadWebhooks = async () => {
    try {
      setIsLoading(true);
      const data = await getWebhooks(projectId);
      setWebhooks(data);
    } catch (error) {
      console.error("Failed to load webhooks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWebhook = async () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      return;
    }

    try {
      await createWebhook(
        formData.name,
        formData.url,
        ["room.started", "room.finished", "participant.joined", "participant.left"],
        projectId,
      );
      await loadWebhooks();
      setFormData({ name: "", url: "", signingKey: "" });
      setShowCreate(false);
    } catch (error) {
      alert("Failed to create webhook");
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (confirm("Are you sure you want to delete this webhook?")) {
      try {
        await deleteWebhook(id, projectId);
        await loadWebhooks();
      } catch (error) {
        alert("Failed to delete webhook");
      }
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <>
      <Header
        projectName="Default Project"
        pageName="Webhooks"
        showTimeRange={false}
        actionButton={
          <Button onClick={() => setShowCreate(true)}>Create new webhook</Button>
        }
      />

      <div className="p-4 md:p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-3">Webhooks</h2>
              <p className="text-muted-foreground leading-relaxed">
                LiveKit can be configured to notify your server when room events take place.
              </p>
            </div>

            {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
            ) : webhooks.length === 0 ? (
          <div className="rounded-lg border border-border/40 bg-white dark:bg-surface/30 p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-muted/20 flex items-center justify-center">
                <Globe className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
            <p className="text-muted-foreground mb-6">You don't have any webhooks added.</p>
            <Button onClick={() => setShowCreate(true)}>Create new webhook</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border border-border/40 bg-white dark:bg-surface/30 hover:bg-gray-50 dark:hover:bg-surface/50 transition-colors"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-foreground font-medium text-sm truncate">
                      {webhook.name || "Untitled Webhook"}
                    </span>
                    <span className="text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="text-[11px] font-mono text-muted-foreground truncate max-w-md bg-muted/20 px-1.5 py-0.5 rounded">
                      {webhook.url}
                    </code>
                    <button
                      onClick={() => handleCopyUrl(webhook.url)}
                      className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copiedUrl === webhook.url ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 mt-3 md:mt-0">
                  <div className="hidden sm:block text-right">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Events</p>
                    <p className="text-xs text-foreground font-medium">{webhook.events.length} subscribed</p>
                  </div>
                  <button
                    onClick={() => handleDeleteWebhook(webhook.id)}
                    className="p-2 rounded-lg text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
          </div>

          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-5 border-border/60 bg-linear-to-br from-white to-gray-50/50 dark:from-surface/40 dark:to-surface/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Webhooks status</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-border/30 pb-2">
                  <span className="text-muted-foreground">Total Endpoints</span>
                  <span className="font-bold text-foreground">{webhooks.length} / 10</span>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 text-[12px] text-blue-600 dark:text-blue-400">
                  <strong>Verification:</strong> All requests are signed with your project's secret key.
                </div>
              </div>
            </Card>

            <Card className="p-5 border-border/60">
              <h3 className="text-sm font-semibold text-foreground mb-4">Supported Events</h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "room.started",
                  "room.finished",
                  "participant.joined",
                  "participant.left",
                  "egress.started",
                  "egress.updated"
                ].map(event => (
                  <div key={event} className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    {event}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 border-border/60">
              <h3 className="text-[13px] font-bold text-foreground uppercase tracking-wider mb-4">Documentation</h3>
              <div className="space-y-3">
                <a href="#" className="flex items-center gap-3 group p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <ExternalLink className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground group-hover:text-primary">Webhook signatures</span>
                </a>
                <a href="#" className="flex items-center gap-3 group p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <ExternalLink className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground group-hover:text-primary">Handling retries</span>
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
          setFormData({ name: "", url: "", signingKey: "" });
        }}
        title="New webhook endpoint"
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setShowCreate(false);
                setFormData({ name: "", url: "", signingKey: "" });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateWebhook}
              disabled={
                !formData.name.trim() ||
                !formData.url.trim()
              }
            >
              Create
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="My Webhook"
              autoFocus
              className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-muted/20 border border-border/60 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder="https://my.domain/webhook"
              className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-muted/20 border border-border/60 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
