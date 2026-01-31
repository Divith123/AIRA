"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "../../../../components/layouts/DashboardLayout";
import Header from "../../../components/Header";
import { Button } from "../../../../components/ui/Button";

export default function TeamMembersPage() {
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
      Invite team member
    </Button>
  );

  return (
    <DashboardLayout user={user}>
      <Header projectName={projectName} pageName="Members" showTimeRange={false} actionButton={actionButton} />

      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground mb-2">Team members</h1>
          <p className="text-secondary text-sm">Manage project access and roles.</p>
        </div>

        {/* Team member card */}
        <div className="rounded-lg bg-surface border border-white/10 p-4 transition-colors hover:bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded bg-gradient-to-br from-[#00d4aa] to-[#00a8e8] flex items-center justify-center text-white font-semibold">
                D
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-foreground text-[13px] font-medium">Divith Selvam</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-secondary text-[10px] uppercase font-semibold">You</span>
                </div>
                <p className="text-secondary text-[12px]">hustleronduty@gmail.com · Admin</p>
              </div>
            </div>
            <button className="text-secondary hover:text-foreground transition-colors p-2 text-sm">
              Edit
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
