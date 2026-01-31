"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "../../../../components/layouts/DashboardLayout";
import Header from "../../../components/Header";
import { Button } from "../../../../components/ui/Button";
import { SearchSmIcon } from "../../../components/icons";
import { Modal } from "../../../../components/ui/Modal";

export default function SipTrunksPage() {
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
      Create new trunk
    </Button>
  );

  return (
    <DashboardLayout user={user}>
      <Header
        projectName={projectName}
        pageName="SIP Trunks"
        showTimeRange={false}
        actionButton={actionButton}
      />

      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground mb-2">SIP Trunks</h1>
          <p className="text-secondary text-sm">
            Connect your existing telephony infrastructure. {' '}
            <a href="#" className="text-[#00d4aa] hover:underline">Learn more in the docs</a>
          </p>
        </div>

        {/* Empty State */}
        <div className="rounded-lg bg-surface border border-white/10 overflow-hidden min-h-[400px] flex flex-col items-center justify-center">
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No SIP trunks configured</h3>
            <p className="text-secondary text-sm mb-6 max-w-sm mx-auto">
              Configure inbound and outbound SIP trunks to connect with your carrier.
            </p>
            <Button
              className="bg-[#00d4aa] text-black hover:bg-[#00e5c0]"
              onClick={() => setIsModalOpen(true)}
            >
              Create new trunk
            </Button>
          </div>
        </div>

        {/* Create Trunk Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create a new SIP trunk"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button className="bg-[#00d4aa] text-black hover:bg-[#00e5c0]" onClick={() => setIsModalOpen(false)}>Create trunk</Button>
            </>
          }
        >
          <div className="space-y-6">
            <div>
              <label className="block text-[13px] font-medium text-foreground mb-2">Trunk name</label>
              <input type="text" className="w-full px-3 py-2 bg-surface border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-[#00d4aa]/50" placeholder="My trunk" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-4">Inbound settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-foreground mb-2">Inbound numbers (regex)</label>
                    <input type="text" className="w-full px-3 py-2 bg-surface border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-[#00d4aa]/50" placeholder="^\+1555.*" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-foreground mb-2">Allowed IPs (CIDR)</label>
                    <textarea className="w-full px-3 py-2 bg-surface border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-[#00d4aa]/50 h-24" placeholder="1.1.1.1/32"></textarea>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground mb-4">Outbound settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-foreground mb-2">Address</label>
                    <input type="text" className="w-full px-3 py-2 bg-surface border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-[#00d4aa]/50" placeholder="sip.provider.com" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-foreground mb-2">Username</label>
                    <input type="text" className="w-full px-3 py-2 bg-surface border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-[#00d4aa]/50" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-foreground mb-2">Password</label>
                    <input type="password" className="w-full px-3 py-2 bg-surface border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-[#00d4aa]/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>

      </div>
    </DashboardLayout>
  );
}
