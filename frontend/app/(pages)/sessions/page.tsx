"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "../../../components/layouts/DashboardLayout";
import Header from "../../components/Header";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { InfoIcon, FilterIcon, SearchSmIcon } from "../../components/icons";

export default function SessionsPage() {
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
      <Header projectName={projectName} pageName="Sessions" />

      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-secondary text-[11px] font-semibold uppercase tracking-wider">Unique participants</span>
                <InfoIcon className="w-3.5 h-3.5 text-secondary" />
              </div>
              <div className="text-primary text-3xl font-semibold">0</div>
            </div>
            {/* Can add a mini chart or icon here later */}
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-secondary text-[11px] font-semibold uppercase tracking-wider">Total rooms</span>
                <InfoIcon className="w-3.5 h-3.5 text-secondary" />
              </div>
              <div className="text-primary text-3xl font-semibold">0</div>
            </div>
          </Card>
        </div>

        {/* Sessions Table */}
        <div className="rounded-xl bg-surface border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-hover/50">
            <h3 className="text-foreground font-medium">Sessions</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" icon={<FilterIcon className="w-3.5 h-3.5" />}>
                Filters
              </Button>
              <Button variant="outline" size="sm" className="px-2">
                <SearchSmIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-hover/30">
                  <th className="text-left px-6 py-3 text-secondary text-[11px] font-semibold uppercase tracking-wider">Session ID</th>
                  <th className="text-left px-6 py-3 text-secondary text-[11px] font-semibold uppercase tracking-wider">Room name</th>
                  <th className="text-left px-6 py-3 text-secondary text-[11px] font-semibold uppercase tracking-wider">
                    <span className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                      Started at
                      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </th>
                  <th className="text-left px-6 py-3 text-secondary text-[11px] font-semibold uppercase tracking-wider">Ended at</th>
                  <th className="text-left px-6 py-3 text-secondary text-[11px] font-semibold uppercase tracking-wider">Duration</th>
                  <th className="text-left px-6 py-3 text-secondary text-[11px] font-semibold uppercase tracking-wider">Participants</th>
                  <th className="text-left px-6 py-3 text-secondary text-[11px] font-semibold uppercase tracking-wider">Features</th>
                  <th className="text-left px-6 py-3 text-secondary text-[11px] font-semibold uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-secondary text-sm">
                    No sessions found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
