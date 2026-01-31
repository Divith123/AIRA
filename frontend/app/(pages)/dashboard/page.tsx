"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "../../../components/layouts/DashboardLayout";
import Header from "../../components/Header";
import { StatsCard } from "../../../components/StatsCard";
import { GetStartedCard } from "../../../components/GetStartedCard";
import { Card } from "../../../components/ui/Card";
import {
  ChevronRightIcon,
  TelephonyCardIcon
} from "../../components/icons";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [projectName, setProjectName] = useState("My Project");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedProject = localStorage.getItem("projectName");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(storedUser));
    if (storedProject) {
      setProjectName(storedProject);
    }
  }, [router]);

  if (!user) return null;

  return (
    <DashboardLayout user={user}>
      <Header projectName={projectName} pageName="Overview" />

      <div className="space-y-8 animate-fade-in pb-10">
        <GetStartedCard />

        <div className="space-y-4">
          <h3 className="text-foreground font-display font-medium text-lg px-1">Recent Activity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              label="Connection success"
              value="98.2%"
              subValue="+2.1% this week"
              chart={
                <div className="relative mt-2">
                  <div className="w-1 h-1 rounded-full bg-success shadow-[0_0_10px_theme(colors.success)]" />
                  <div className="absolute inset-0 w-1 h-1 rounded-full bg-success animate-ping opacity-75" />
                </div>
              }
            />
            <StatsCard label="Active Rooms" value="12" subValue="Across 3 regions" empty={false} />
            <StatsCard label="Data Transfer" value="24.5 GB" subValue="Inbound" empty={false} />
            <StatsCard label="Top Region" value="US-East" subValue="Virginia" empty={false} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-foreground font-display font-medium text-lg px-1">Quick Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Participants",
                "Agents",
                "Telephony",
                "Data transfer",
                "Rooms",
                "Egress",
                "Ingress",
              ].map((section) => (
                <button
                  key={section}
                  className="flex items-center justify-between p-4 rounded-xl bg-surface/50 border border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 text-left group shadow-sm hover:shadow-md"
                >
                  <span className="text-foreground text-sm font-medium group-hover:text-primary transition-colors">{section}</span>
                  <ChevronRightIcon className="text-muted-foreground w-4 h-4 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-foreground font-display font-medium text-lg px-1">Integrations</h3>
            <Card variant="glass" className="p-0 border-white/5 bg-gradient-to-br from-surface to-surface/50 overflow-hidden hover:border-primary/20 transition-all group cursor-pointer">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
                    <TelephonyCardIcon className="w-6 h-6" />
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <h3 className="text-foreground font-semibold mb-1.5 group-hover:text-primary transition-colors">Telephony integration</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Connect your voice AI agents to the PSTN network seamlessly.</p>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-primary to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
