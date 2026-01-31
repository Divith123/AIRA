"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "../../../components/layouts/DashboardLayout";
import Header from "../../components/Header";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Plus, Info, Mic, Code2, Bot } from "lucide-react";

export default function AgentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [projectName, setProjectName] = useState<string>("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedProject = localStorage.getItem("projectName");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
    setProjectName(storedProject || "My Project");
  }, [router]);

  if (!user) return null;

  return (
    <DashboardLayout user={user}>
      <Header
        projectName={projectName}
        pageName="Agents"
        showTimeRange={false}
        actionButton={
          <Button
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => router.push('/agents/ab_6chkk1s1ffy/instructions')}
            className="hidden sm:flex"
          >
            Create agent
          </Button>
        }
      />

      <div className="p-4 md:p-8 animate-fade-in">
        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-10 md:py-20">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full animate-pulse-slow" />
            <div className="w-20 h-20 rounded-2xl bg-surface border border-white/10 flex items-center justify-center mb-8 relative glass-card shadow-xl">
              <Bot className="w-10 h-10 text-primary" />
            </div>
          </div>

          <h2 className="text-foreground font-display text-2xl font-bold mb-3 tracking-tight">Agents</h2>
          <p className="text-muted-foreground text-sm text-center max-w-md mb-10 leading-relaxed">
            Deploy and host agents on Relatim Cloud infrastructure. <br className="hidden sm:block" />
            Your self-hosted agents will appear here too.
          </p>

          <div className="w-full max-w-3xl flex items-center gap-4 mb-10">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-muted-foreground text-[10px] uppercase tracking-widest font-semibold px-2">Get started</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
            {/* Start in browser */}
            <button className="group text-left p-0 transition-all outline-none" onClick={() => router.push('/agents/ab_6chkk1s1ffy/instructions')}>
              <Card variant="glass" className="p-6 h-full group-hover:border-primary/50 group-hover:bg-surface-hover/50 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                  <Mic className="w-24 h-24 text-primary -rotate-12 translate-x-4 -translate-y-4" />
                </div>

                <div className="mb-6 relative z-10">
                  <div className="w-full h-40 rounded-lg bg-black/40 border border-white/5 mb-6 relative overflow-hidden flex items-center justify-center group-hover:border-primary/20 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Mic className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors duration-300 transform group-hover:scale-110" strokeWidth={1.5} />
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-foreground font-display font-semibold text-lg group-hover:text-primary transition-colors">Start in the browser</span>
                    <Info className="text-muted-foreground/50 w-4 h-4 group-hover:text-primary/50 transition-colors" />
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    The fastest way to build agents: prompt first, convert to code later. Best for prototyping and testing simple ideas.
                  </p>
                </div>
              </Card>
            </button>

            {/* Start in code */}
            <button className="group text-left p-0 transition-all outline-none">
              <Card variant="glass" className="p-6 h-full group-hover:border-purple-500/50 group-hover:bg-surface-hover/50 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                  <Code2 className="w-24 h-24 text-purple-500 -rotate-12 translate-x-4 -translate-y-4" />
                </div>

                <div className="mb-6 relative z-10">
                  <div className="w-full h-40 rounded-lg bg-black/40 border border-white/5 mb-6 relative overflow-hidden flex items-center justify-center group-hover:border-purple-500/20 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Code2 className="w-12 h-12 text-muted-foreground group-hover:text-purple-500 transition-colors duration-300 transform group-hover:scale-110" strokeWidth={1.5} />
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-foreground font-display font-semibold text-lg group-hover:text-purple-400 transition-colors">Start in code</span>
                    <Info className="text-muted-foreground/50 w-4 h-4 group-hover:text-purple-500/50 transition-colors" />
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Develop complex voice agent workflows in code using the Agents SDK and deploy straight from your terminal.
                  </p>
                </div>
              </Card>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
