"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "../../../../components/layouts/DashboardLayout";
import Header from "../../../components/Header";
import { SearchSmIcon } from "../../../components/icons";
import { Button } from "../../../../components/ui/Button";

export default function ApiKeysPage() {
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

  const actionButton = (
    <Button size="sm" className="bg-[#00d4aa] text-black hover:bg-[#00e5c0]">
      Create key
    </Button>
  );

  return (
    <DashboardLayout user={user}>
      <Header projectName={projectName} pageName="Keys" showTimeRange={false} actionButton={actionButton} />

      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground mb-2">API keys</h1>
          <p className="text-secondary text-sm">Manage project access keys.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mb-6 border-b border-white/10">
          <button className="pb-3 text-sm font-medium text-foreground border-b-2 border-[#00d4aa]">Your API keys</button>
          <button className="pb-3 text-sm font-medium text-secondary hover:text-foreground transition-colors">Other API keys</button>
        </div>

        {/* API Keys Table */}
        <div className="rounded-lg bg-surface border border-white/10 overflow-hidden">
          <div className="flex items-center justify-end px-4 py-2 border-b border-white/10 bg-white/5">
            <button className="flex items-center justify-center w-8 h-8 rounded text-secondary hover:text-foreground transition-colors hover:bg-white/5">
              <SearchSmIcon className="w-4 h-4" />
            </button>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-secondary text-[11px] font-medium uppercase tracking-wider">
                  <span className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                    Description
                    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="m18 15-6-6-6 6" />
                    </svg>
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-secondary text-[11px] font-medium uppercase tracking-wider">API key</th>
                <th className="text-left px-4 py-3 text-secondary text-[11px] font-medium uppercase tracking-wider">
                  <span className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                    Owner
                    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-secondary text-[11px] font-medium uppercase tracking-wider">
                  <span className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                    Issued on
                    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10 last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-secondary text-[13px]">(none)</td>
                <td className="px-4 py-3 text-[13px] font-mono text-foreground">API5J3a5YmfCfVX</td>
                <td className="px-4 py-3 text-[13px] text-foreground">Divith Selvam</td>
                <td className="px-4 py-3 text-secondary text-[13px]">Jan 31, 2026</td>
                <td className="px-4 py-3">
                  <button className="text-secondary hover:text-foreground transition-colors p-1 rounded hover:bg-white/10">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                      <circle cx="12" cy="6" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="12" cy="18" r="2" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
