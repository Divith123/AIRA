"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "../../../../components/layouts/DashboardLayout";
import Header from "../../../components/Header";
import { Button } from "../../../../components/ui/Button";

export default function WebhooksPage() {
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
      Create new webhook
    </Button>
  );

  return (
    <DashboardLayout user={user}>
      <Header projectName={projectName} pageName="Webhooks" showTimeRange={false} actionButton={actionButton} />

      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground mb-2">Webhooks</h1>
          <p className="text-secondary text-sm max-w-2xl">
            Relatim can be configured to notify your server when room events take place. This can be helpful for your backend to know when a room has finished, or when a participant leaves. For information about how to set up webhooks check out our <a href="#" className="text-[#00d4aa] hover:underline">documentation</a>.
          </p>
        </div>

        {/* Empty state */}
        <div className="rounded-lg bg-surface border border-white/10 p-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-white/5">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4" />
                <path d="M12 18v4" />
                <path d="M4.93 4.93l2.83 2.83" />
                <path d="M16.24 16.24l2.83 2.83" />
                <path d="M2 12h4" />
                <path d="M18 12h4" />
                <path d="M4.93 19.07l2.83-2.83" />
                <path d="M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <p className="text-secondary text-sm mb-6">You don&apos;t have any webhooks added.</p>
            <Button size="sm" className="bg-[#00d4aa] text-black hover:bg-[#00e5c0]">
              Create new webhook
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
