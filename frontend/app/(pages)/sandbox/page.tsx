"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "../../../components/layouts/DashboardLayout";
import Header from "../../components/Header";
import { Card } from "../../../components/ui/Card";
import { SandboxIcon } from "../../components/icons";

export default function SandboxPage() {
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
      <Header projectName={projectName} pageName="Sandbox" showTimeRange={false} />

      <div className="p-8">
        {/* Get started section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-foreground text-lg font-medium">Get started</h2>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded text-secondary hover:text-foreground hover:bg-white/5 transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded text-secondary hover:text-foreground hover:bg-white/5 transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Web Voice Agent */}
            <button className="group text-left p-0 transition-all outline-none">
              <Card className="p-5 h-full group-hover:border-primary/50 group-hover:bg-surface-hover transition-all">
                <div className="w-full h-32 rounded-lg bg-black/40 border border-white/5 mb-4 relative overflow-hidden flex items-center justify-center group-hover:border-primary/20 transition-colors">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-6 bg-white/10 rounded-full group-hover:bg-primary/40 transition-colors"></div>
                      <div className="w-1.5 h-10 bg-white/10 rounded-full group-hover:bg-primary/60 transition-colors"></div>
                      <div className="w-1.5 h-14 bg-white/20 rounded-full group-hover:bg-primary transition-colors"></div>
                      <div className="w-1.5 h-10 bg-white/10 rounded-full group-hover:bg-primary/60 transition-colors"></div>
                      <div className="w-1.5 h-6 bg-white/10 rounded-full group-hover:bg-primary/40 transition-colors"></div>
                    </div>
                  </div>
                </div>
                <h3 className="text-foreground font-medium mb-1 group-hover:text-primary transition-colors">Web Voice Agent</h3>
                <p className="text-secondary text-xs leading-relaxed">
                  A starter app for Next.js, featuring a flexible voice AI frontend
                </p>
              </Card>
            </button>

            {/* Token server */}
            <button className="group text-left p-0 transition-all outline-none">
              <Card className="p-5 h-full group-hover:border-primary/50 group-hover:bg-surface-hover transition-all">
                <div className="w-full h-32 rounded-lg bg-black/40 border border-white/5 mb-4 relative overflow-hidden flex items-center justify-center group-hover:border-primary/20 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <ellipse cx="12" cy="5" rx="9" ry="3" />
                      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
                      <path d="M3 12A9 3 0 0 0 21 12" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-foreground font-medium mb-1 group-hover:text-primary transition-colors">Token server</h3>
                <p className="text-secondary text-xs leading-relaxed">
                  A hosted token server to help you prototype your mobile applications faster
                </p>
              </Card>
            </button>

            {/* Video conference */}
            <button className="group text-left p-0 transition-all outline-none">
              <Card className="p-5 h-full group-hover:border-primary/50 group-hover:bg-surface-hover transition-all">
                <div className="w-full h-32 rounded-lg bg-black/40 border border-white/5 mb-4 relative overflow-hidden flex items-center justify-center group-hover:border-primary/20 transition-colors">
                  <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-20 bg-white/5 rounded-lg border border-white/5"></div>
                    <div className="flex flex-col gap-2">
                      <div className="w-12 h-9 bg-white/5 rounded-lg border border-white/5"></div>
                      <div className="w-12 h-9 bg-white/5 rounded-lg border border-white/5"></div>
                    </div>
                  </div>
                </div>
                <h3 className="text-foreground font-medium mb-1 group-hover:text-primary transition-colors">Video conference</h3>
                <p className="text-secondary text-xs leading-relaxed">
                  An open source video conferencing app built on Relatim Components, Relatim Cloud...
                </p>
              </Card>
            </button>
          </div>
        </div>

        {/* Sandbox apps section */}
        <div>
          <h2 className="text-foreground text-lg font-medium mb-4">Sandbox apps</h2>
          <Card className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-2xl bg-surface-hover border border-border">
              <SandboxIcon className="w-8 h-8 text-secondary" />
            </div>
            <p className="text-secondary text-sm text-center max-w-xl leading-relaxed">
              Sandbox allows you to quickly prototype apps and agents running in your cloud without the need to manage deployments and tokens. Read our{" "}
              <a href="#" className="text-primary hover:underline hover:text-primary-hover transition-colors">sandbox documentation</a>{" "}
              to learn more.
            </p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
