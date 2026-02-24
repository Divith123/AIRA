"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import AgentPreview from "./AgentPreview";
import { Button } from "../ui/Button";
import { ArrowLeft, MoreVertical, Check } from "lucide-react";
import { cn } from "../../lib/utils";
import { getAgentById, Agent } from "../../lib/api";
import { formatDistanceToNow } from "date-fns";

interface AgentLayoutProps {
  children: React.ReactNode;
}

export default function AgentLayout({ children }: AgentLayoutProps) {
  const pathname = usePathname();
  const params = useParams();
  const agentId = Array.isArray(params.agentId) ? params.agentId[0] : params.agentId;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAgent = async () => {
      if (!agentId) return;
      try {
        const data = await getAgentById(agentId);
        setAgent(data);
      } catch (error) {
        console.error("Failed to load agent layout data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAgent();
  }, [agentId]);

  const tabs = [
    { name: "Instructions", path: `/agents/${agentId}/instructions` },
    { name: "Models & Voice", path: `/agents/${agentId}/models` },
    { name: "Actions", path: `/agents/${agentId}/actions` },
    { name: "Advanced", path: `/agents/${agentId}/advanced` },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Agent Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-surface">
        <div className="flex items-center gap-4">
          <Link href="/agents" className="p-2 hover:bg-muted/50 rounded-lg transition-colors border border-border/40">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-[15px] font-bold tracking-tight text-foreground flex items-center gap-2">
                {loading ? "Loading..." : (agent?.name || agentId)}
                <MoreVertical className="w-3.5 h-3.5 text-muted-foreground/40" />
              </h1>
              {!loading && (
                <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-muted/30 border border-border/40">
                  <div className={cn("w-1.5 h-1.5 rounded-full", agent?.status === 'active' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-slate-400")} />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{agent?.status || 'Pending'}</span>
                </div>
              )}
            </div>
            {!loading && agent?.updated_at && (
              <div className="text-[11px] text-muted-foreground/60">
                Last saved {formatDistanceToNow(new Date(agent.updated_at))} ago
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-muted-foreground">
            <Check className="w-3.5 h-3.5 text-green-500" />
            <span className="text-xs font-medium">Changes synced</span>
          </div>
          
          <Link href={`/agents/${agentId}/deploy`}>
            <Button 
              size="sm" 
              className="bg-[oklch(0.627_0.265_273.15)] hover:bg-[oklch(0.55_0.25_273.15)] text-white font-bold h-9 px-4 rounded-lg text-[11px] uppercase tracking-wider"
            >
              Deploy agent
            </Button>
          </Link>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="px-10 border-b border-border/40 bg-surface sticky top-0 z-20">
        <div className="flex items-center gap-8">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              href={tab.path}
              className={cn(
                "py-3 text-[13px] font-bold transition-all duration-200 border-b-2 -mb-[1px]",
                isActive(tab.path)
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex bg-surface">
        {/* Scrollable Children (Left Panel) */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar border-r border-border/40">
          {children}
        </div>

        {/* Right Panel (Preview/Code) */}
        <div className="hidden lg:block w-[500px] flex-shrink-0 relative z-10 bg-muted/5">
          <AgentPreview />
        </div>
      </div>
    </div>
  );
}
