"use client";

import React, { useState } from "react";
// DashboardLayout removed
import Header from "../../../components/Header";
import { Button } from "../../../../components/ui/Button";
import { Modal } from "../../../../components/ui/Modal";
import { Card } from "../../../../components/ui/Card";
import { AiraLoader } from "../../../../components/ui/AiraLoader";
import { Copy, Check, Info, ExternalLink } from "lucide-react";

import { Skeleton } from "../../../../components/ui/Skeleton";

interface ApiKeysPageProps {
  projectId?: string;
}

// Static API Key Data
const LIVEKIT_CONFIG = {
  LIVEKIT_URL: "https://livekit.divithselvam.in",
  LIVEKIT_API_URL: "https://livekit.divithselvam.in",
  LIVEKIT_API_KEY: "APIfoCj3yPxYCkF",
  LIVEKIT_API_SECRET: "CU45Bi5wxyokewomL6orrs1g7M95QREr9cvNY3H4ctT",
};

export default function ApiKeysPage({ projectId }: ApiKeysPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showView, setShowView] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopyField = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <>
      {isLoading && <AiraLoader />}
      <Header
        projectName="Default Project"
        pageName="Keys"
        showTimeRange={false}
        actionButton={
          <Button onClick={() => setShowView(true)}>View API Key</Button>
        }
      />

      <div className="p-4 md:p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-2">API Key</h2>
              <p className="text-muted-foreground">Your LiveKit API credentials for server integration.</p>
            </div>

            <div className="rounded-lg border border-border/40 bg-white dark:bg-surface/30 p-6 space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-400 font-medium">
                  These credentials are required for backend integration with LiveKit.
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">LiveKit URL</label>
                  <div className="mt-2 flex items-center justify-between bg-gray-50 dark:bg-muted/20 border border-border/40 rounded-lg p-3">
                    <code className="text-sm text-foreground break-all">{LIVEKIT_CONFIG.LIVEKIT_URL}</code>
                    <button
                      onClick={() => handleCopyField(LIVEKIT_CONFIG.LIVEKIT_URL, "LIVEKIT_URL")}
                      className="ml-2 p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                    >
                      {copiedField === "LIVEKIT_URL" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">LiveKit API URL</label>
                  <div className="mt-2 flex items-center justify-between bg-gray-50 dark:bg-muted/20 border border-border/40 rounded-lg p-3">
                    <code className="text-sm text-foreground break-all">{LIVEKIT_CONFIG.LIVEKIT_API_URL}</code>
                    <button
                      onClick={() => handleCopyField(LIVEKIT_CONFIG.LIVEKIT_API_URL, "LIVEKIT_API_URL")}
                      className="ml-2 p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                    >
                      {copiedField === "LIVEKIT_API_URL" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">LiveKit API Key</label>
                  <div className="mt-2 flex items-center justify-between bg-gray-50 dark:bg-muted/20 border border-border/40 rounded-lg p-3">
                    <code className="text-sm text-foreground break-all font-mono">{LIVEKIT_CONFIG.LIVEKIT_API_KEY}</code>
                    <button
                      onClick={() => handleCopyField(LIVEKIT_CONFIG.LIVEKIT_API_KEY, "LIVEKIT_API_KEY")}
                      className="ml-2 p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                    >
                      {copiedField === "LIVEKIT_API_KEY" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">LiveKit API Secret</label>
                  <div className="mt-2 flex items-center justify-between bg-gray-50 dark:bg-muted/20 border border-border/40 rounded-lg p-3">
                    <code className="text-sm text-foreground break-all font-mono">{LIVEKIT_CONFIG.LIVEKIT_API_SECRET}</code>
                    <button
                      onClick={() => handleCopyField(LIVEKIT_CONFIG.LIVEKIT_API_SECRET, "LIVEKIT_API_SECRET")}
                      className="ml-2 p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                    >
                      {copiedField === "LIVEKIT_API_SECRET" ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
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
                  Your LiveKit API credentials are required to configure backend services and server authentication for real-time communications.
                </div>
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[12px] text-amber-600 dark:text-amber-400">
                  <strong>Security Note:</strong> Keep these credentials secret and secure.
                </div>
              </div>
            </Card>

            <Card className="p-5 border-border/60 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground mb-4">API Certificate</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-border/30 pb-2">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-mono font-medium text-green-600">Active</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-border/30 pb-2">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="text-foreground">LiveKit</span>
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
        isOpen={showView}
        onClose={() => setShowView(false)}
        title="API Key Credentials"
        footer={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowView(false)}
            >
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use these credentials to configure your backend services with LiveKit.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">LiveKit URL</label>
              <div className="mt-2 flex items-center justify-between bg-gray-50 dark:bg-muted/20 border border-border/40 rounded-lg p-3">
                <code className="text-sm text-foreground break-all">{LIVEKIT_CONFIG.LIVEKIT_URL}</code>
                <button
                  onClick={() => handleCopyField(LIVEKIT_CONFIG.LIVEKIT_URL, "modal-LIVEKIT_URL")}
                  className="ml-2 p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                >
                  {copiedField === "modal-LIVEKIT_URL" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">LiveKit API URL</label>
              <div className="mt-2 flex items-center justify-between bg-gray-50 dark:bg-muted/20 border border-border/40 rounded-lg p-3">
                <code className="text-sm text-foreground break-all">{LIVEKIT_CONFIG.LIVEKIT_API_URL}</code>
                <button
                  onClick={() => handleCopyField(LIVEKIT_CONFIG.LIVEKIT_API_URL, "modal-LIVEKIT_API_URL")}
                  className="ml-2 p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                >
                  {copiedField === "modal-LIVEKIT_API_URL" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">LiveKit API Key</label>
              <div className="mt-2 flex items-center justify-between bg-gray-50 dark:bg-muted/20 border border-border/40 rounded-lg p-3">
                <code className="text-sm text-foreground break-all font-mono">{LIVEKIT_CONFIG.LIVEKIT_API_KEY}</code>
                <button
                  onClick={() => handleCopyField(LIVEKIT_CONFIG.LIVEKIT_API_KEY, "modal-LIVEKIT_API_KEY")}
                  className="ml-2 p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                >
                  {copiedField === "modal-LIVEKIT_API_KEY" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">LiveKit API Secret</label>
              <div className="mt-2 flex items-center justify-between bg-gray-50 dark:bg-muted/20 border border-border/40 rounded-lg p-3">
                <code className="text-sm text-foreground break-all font-mono">{LIVEKIT_CONFIG.LIVEKIT_API_SECRET}</code>
                <button
                  onClick={() => handleCopyField(LIVEKIT_CONFIG.LIVEKIT_API_SECRET, "modal-LIVEKIT_API_SECRET")}
                  className="ml-2 p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                >
                  {copiedField === "modal-LIVEKIT_API_SECRET" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[12px] text-amber-600 dark:text-amber-400">
            <strong>Security Note:</strong> Keep these credentials secret. Do not share them publicly or commit them to version control.
          </div>
        </div>
      </Modal>
    </>
  );
}
