"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import { InfoIcon, FilterIcon, SearchSmIcon } from "../../../components/icons";

export default function CallsPage() {
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
    <div className="min-h-screen bg-[#09090b] font-sans text-[#fafafa]">
      <Sidebar user={user} />
      <main className="ml-[240px]">
        <Header projectName={projectName} pageName="Telephony" />
        
        <div className="p-6">
          {/* Stats Row 1 */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-4 rounded-lg bg-[#18181b] border border-white/[0.06]">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-[#a1a1aa] text-[11px] font-medium uppercase tracking-wider">Total calls</span>
                <InfoIcon />
              </div>
              <div className="text-[#a1a1aa] text-2xl font-medium">0</div>
            </div>

            <div className="p-4 rounded-lg bg-[#18181b] border border-white/[0.06]">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-[#a1a1aa] text-[11px] font-medium uppercase tracking-wider">Total call duration</span>
                <InfoIcon />
              </div>
              <div className="text-[#a1a1aa] text-2xl font-medium">0 secs</div>
            </div>

            <div className="p-4 rounded-lg bg-[#18181b] border border-white/[0.06]">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-[#a1a1aa] text-[11px] font-medium uppercase tracking-wider">Average call duration</span>
                <InfoIcon />
              </div>
              <div className="text-[#a1a1aa] text-2xl font-medium">0 secs</div>
            </div>
          </div>

          {/* Stats Row 2 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-[#18181b] border border-white/[0.06]">
              <div className="flex items-center gap-1.5 mb-4">
                <span className="text-[#00d4aa] text-[11px] font-medium uppercase tracking-wider">Active calls</span>
                <InfoIcon />
              </div>
              <div className="text-[#00d4aa] text-4xl font-medium py-4">0</div>
            </div>

            <div className="p-4 rounded-lg bg-[#18181b] border border-white/[0.06]">
              <div className="flex items-center gap-1.5 mb-4">
                <span className="text-[#00d4aa] text-[11px] font-medium uppercase tracking-wider">Calls with issues</span>
                <InfoIcon />
              </div>
              <div className="text-[#00d4aa] text-4xl font-medium py-4">0</div>
            </div>
          </div>

          {/* Calls Table */}
          <div className="rounded-lg bg-[#18181b] border border-white/[0.06] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <span className="text-white text-[14px] font-medium">Calls</span>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-white/[0.08] bg-transparent text-[#a1a1aa] text-[12px] hover:text-white hover:border-white/[0.12] transition-colors">
                  <FilterIcon />
                  <span>Filters</span>
                </button>
                <button className="flex items-center justify-center w-8 h-8 rounded border border-white/[0.08] bg-transparent text-[#a1a1aa] hover:text-white hover:border-white/[0.12] transition-colors">
                  <SearchSmIcon />
                </button>
              </div>
            </div>
            
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-2.5 text-[#a1a1aa] text-[11px] font-medium uppercase tracking-wider">ID</th>
                  <th className="text-left px-4 py-2.5 text-[#a1a1aa] text-[11px] font-medium uppercase tracking-wider">From</th>
                  <th className="text-left px-4 py-2.5 text-[#a1a1aa] text-[11px] font-medium uppercase tracking-wider">To</th>
                  <th className="text-left px-4 py-2.5 text-[#a1a1aa] text-[11px] font-medium uppercase tracking-wider">Direction</th>
                  <th className="text-left px-4 py-2.5 text-[#a1a1aa] text-[11px] font-medium uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      Started at
                      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </span>
                  </th>
                  <th className="text-left px-4 py-2.5 text-[#a1a1aa] text-[11px] font-medium uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      Ended at
                      <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="m18 15-6-6-6 6"/>
                      </svg>
                    </span>
                  </th>
                  <th className="text-left px-4 py-2.5 text-[#a1a1aa] text-[11px] font-medium uppercase tracking-wider">Duration</th>
                  <th className="text-left px-4 py-2.5 text-[#a1a1aa] text-[11px] font-medium uppercase tracking-wider">Session</th>
                  <th className="text-left px-4 py-2.5 text-[#a1a1aa] text-[11px] font-medium uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[#52525b] text-[13px]">
                    No results.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
