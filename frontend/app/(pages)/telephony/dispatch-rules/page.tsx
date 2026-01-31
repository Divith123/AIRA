"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "../../../../components/layouts/DashboardLayout";
import Header from "../../../components/Header";
import { Button } from "../../../../components/ui/Button";
import { InfoIcon, SearchSmIcon } from "../../../components/icons";
import { Modal } from "../../../../components/ui/Modal";
import { Select } from "../../../../components/ui/Select";

export default function DispatchRulesPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [projectName, setProjectName] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <Button
      size="sm"
      className="bg-[#00d4aa] text-black hover:bg-[#00e5c0]"
      onClick={() => setIsModalOpen(true)}
    >
      Create new dispatch rule
    </Button>
  );

  return (
    <DashboardLayout user={user}>
      <Header
        projectName={projectName}
        pageName="Dispatch rules"
        showTimeRange={false}
        actionButton={actionButton}
      />

      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground mb-2">Dispatch rules</h1>
          <p className="text-secondary text-sm">
            Router specific inbound calls to Agents or Rooms. {' '}
            <a href="#" className="text-[#00d4aa] hover:underline">Learn more in the docs</a>
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 relative max-w-md">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
            <SearchSmIcon className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search dispatch rules"
            className="w-full pl-10 pr-4 py-2 bg-surface border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50"
          />
        </div>

        {/* Table */}
        <div className="rounded-lg bg-surface border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-4 py-3 text-secondary text-[11px] font-medium uppercase tracking-wider">Rule Name</th>
                <th className="text-left px-4 py-3 text-secondary text-[11px] font-medium uppercase tracking-wider">Rule Type</th>
                <th className="text-left px-4 py-3 text-secondary text-[11px] font-medium uppercase tracking-wider">Inbound Numbers</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/10 last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-[13px] text-foreground font-medium">Default Rule</td>
                <td className="px-4 py-3 text-[13px] text-secondary">Individual</td>
                <td className="px-4 py-3 text-[13px] text-secondary">--</td>
                <td className="px-4 py-3">
                  <button className="text-secondary hover:text-foreground transition-colors p-1 rounded hover:bg-white/10">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><circle cx="12" cy="12" r="2" /><circle cx="12" cy="6" r="2" /><circle cx="12" cy="18" r="2" /></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Create Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create a new dispatch rule"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button className="bg-[#00d4aa] text-black hover:bg-[#00e5c0]" onClick={() => setIsModalOpen(false)}>Create</Button>
            </>
          }
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-sm font-medium border-b border-white/10 mb-4">
              <button className="pb-2 border-b-2 border-[#00d4aa] text-foreground">DISPATCH RULE DETAILS</button>
              <button className="pb-2 text-secondary hover:text-foreground transition-colors">JSON EDITOR</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-2">Rule name</label>
                <input type="text" className="w-full px-3 py-2 bg-surface border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-[#00d4aa]/50" placeholder="My rule" />
              </div>

              <Select
                label="Rule type"
                options={[
                  { label: "Individual", value: "individual" },
                  { label: "Round Robin", value: "round-robin" },
                  { label: "Broadcast", value: "broadcast" }
                ]}
              />

              <div>
                <label className="block text-[13px] font-medium text-foreground mb-2">Room prefix</label>
                <input type="text" className="w-full px-3 py-2 bg-surface border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-[#00d4aa]/50" defaultValue="prm-" />
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-sm font-medium text-foreground mb-2">Inbound routing</h3>
              <p className="text-xs text-secondary mb-4">Configure origination by setting up how inbound calls will be dispatched to LiveKit rooms.</p>

              <div className="flex border-b border-white/10 mb-4">
                <button className="flex-1 pb-2 text-xs font-medium text-[#00d4aa] border-b border-[#00d4aa]">Phone numbers</button>
                <button className="flex-1 pb-2 text-xs font-medium text-secondary hover:text-foreground">Trunks</button>
              </div>
              <div className="text-center py-8 text-secondary text-sm">
                No phone numbers owned
              </div>
            </div>
          </div>
        </Modal>

      </div>
    </DashboardLayout>
  );
}
