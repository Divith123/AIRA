"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "../../../../components/layouts/DashboardLayout";
import Header from "../../../components/Header";
import { InfoIcon, CopyIcon } from "../../../components/icons";
import { Button } from "../../../../components/ui/Button";

export default function ProjectSettingsPage() {
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
      Save changes
    </Button>
  );

  const InputWithCopy = ({ label, value, info = false }: { label: string; value: string; info?: boolean }) => (
    <div className="mb-5">
      <div className="flex items-center gap-1.5 mb-2">
        <label className="text-foreground text-[13px] font-medium">{label}</label>
        {info && <InfoIcon className="w-3.5 h-3.5 text-secondary" />}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          readOnly
          className="flex-1 px-3 py-2 rounded-lg bg-surface border border-white/10 text-secondary text-[13px] focus:outline-none"
        />
        <button className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface border border-white/10 text-secondary hover:text-foreground transition-colors hover:bg-white/5">
          <CopyIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const Checkbox = ({ label, checked = false, info = false }: { label: string; checked?: boolean; info?: boolean }) => (
    <label className="flex items-start gap-2.5 cursor-pointer mb-3 group">
      <div className="relative flex items-center pt-0.5">
        <input type="checkbox" defaultChecked={checked} className="peer sr-only" />
        <div className="w-4 h-4 rounded border border-white/20 bg-surface peer-checked:bg-[#00d4aa] peer-checked:border-[#00d4aa] transition-colors"></div>
        <svg viewBox="0 0 24 24" className="w-3 h-3 absolute top-1 left-0.5 text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-secondary text-[13px] group-hover:text-foreground transition-colors">{label}</span>
        {info && <InfoIcon className="w-3.5 h-3.5 text-secondary" />}
      </div>
    </label>
  );

  const limits = [
    { type: "Concurrent participants", limit: "100", usage: "0" },
    { type: "Concurrent Egress requests", limit: "2", usage: "0" },
    { type: "Concurrent Ingress requests", limit: "2", usage: "0" },
    { type: "Concurrent agent sessions", limit: "5", usage: "0" },
    { type: "Concurrent STT", limit: "5", usage: "0" },
    { type: "Concurrent TTS", limit: "5", usage: "0" },
    { type: "LLM requests per minute", limit: "100", usage: "0" },
    { type: "LLM tokens per minute", limit: "600,000", usage: "0" },
  ];

  return (
    <DashboardLayout user={user}>
      <Header projectName={projectName} pageName="Project" showTimeRange={false} actionButton={actionButton} />

      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground mb-2">Project settings</h1>
          <p className="text-secondary text-sm">Manage your project configuration and quotas.</p>
        </div>

        {/* General Section */}
        <section className="mb-10">
          <h2 className="text-base font-medium text-foreground mb-1">General</h2>
          <p className="text-secondary text-[13px] mb-6">
            Set the name that is used to identify your project in the Relatim Cloud dashboard and the Relatim CLI.
          </p>

          {/* Project name */}
          <div className="mb-5">
            <label className="text-foreground text-[13px] font-medium mb-2 block">Project name</label>
            <input
              type="text"
              defaultValue={projectName}
              className="w-full px-3 py-2 rounded-lg bg-surface border border-white/10 text-foreground text-[13px] focus:outline-none focus:border-[#00d4aa]/50"
            />
          </div>

          <InputWithCopy label="Project ID" value="p_2xihhagajzi" info />
          <InputWithCopy label="Project URL" value={`${projectName.toLowerCase()}-project.relatim.cloud`} info />
          <InputWithCopy label="SIP URI" value="sip:2xihhagajzi.sip.relatim.cloud" info />
        </section>

        <div className="h-px bg-white/10 mb-10" />

        {/* Options Section */}
        <section className="mb-10">
          <h2 className="text-base font-medium text-foreground mb-1">Options</h2>
          <p className="text-secondary text-[13px] mb-6">Configure options for your Relatim Cloud project.</p>

          <div className="mb-6">
            <h3 className="text-foreground text-[13px] font-medium mb-3">Rooms and participants</h3>
            <Checkbox label="Automatically create rooms on participant join" checked info />
            <Checkbox label="Admins can remotely unmute tracks" info />
            <Checkbox label="Allow pausing videos when subscribers are congested" info />
          </div>

          <div>
            <h3 className="text-foreground text-[13px] font-medium mb-3">Dashboard</h3>
            <Checkbox label="Show onboarding instructions on dashboard" checked info />
          </div>
        </section>

        <div className="h-px bg-white/10 mb-10" />

        {/* Data and privacy Section */}
        <section className="mb-10">
          <h2 className="text-base font-medium text-foreground mb-1">Data and privacy</h2>
          <p className="text-secondary text-[13px] mb-6">Configure session recording and telemetry for debugging and monitoring</p>

          <div className="mb-2">
            <h3 className="text-foreground text-[13px] font-medium mb-1">Agent observability</h3>
            <p className="text-muted text-[12px] mb-3">
              Capture traces, transcripts, and audio from agent sessions for debugging. Available for hosted and self-hosted agents.{" "}
              <a href="#" className="text-[#00d4aa] hover:underline">See pricing details.</a>
            </p>
            <select className="w-full px-3 py-2 rounded-lg bg-surface border border-white/10 text-secondary text-[13px] focus:outline-none">
              <option>Disabled</option>
              <option>Enabled</option>
            </select>
          </div>
        </section>

        <div className="h-px bg-white/10 mb-10" />

        {/* Enabled codecs Section */}
        <section className="mb-10">
          <h2 className="text-base font-medium text-foreground mb-1">Enabled codecs</h2>
          <p className="text-secondary text-[13px] mb-6">Select which media codecs your project should allow.</p>

          <Checkbox label="Opus" checked info />
          <Checkbox label="Audio RED (REdundant encoding)" checked />
          <Checkbox label="H.264" checked />
          <Checkbox label="VP8" checked />
          <Checkbox label="VP9" checked />
          <Checkbox label="AV1" checked />
        </section>

        <div className="h-px bg-white/10 mb-10" />

        {/* Connection limits Section */}
        <section className="mb-10">
          <h2 className="text-base font-medium text-foreground mb-1">Connection limits</h2>
          <p className="text-secondary text-[13px] mb-4">
            To ensure the stability of our network and to prevent abuse, Relatim Cloud projects have limitations on the number of concurrent connections. Service may be disrupted when these limits are exceeded.
          </p>
          <p className="text-secondary text-[13px] mb-6">
            If you anticipate needing more concurrent connections and/or inference credits for your project, <a href="#" className="text-[#00d4aa] hover:underline">upgrade to the Scale plan</a>.
          </p>

          <div className="rounded-lg bg-surface border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 text-secondary text-[11px] font-medium uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-secondary text-[11px] font-medium uppercase tracking-wider">Limit</th>
                  <th className="text-left px-4 py-3 text-secondary text-[11px] font-medium uppercase tracking-wider">Peak usage (past 7 days)</th>
                </tr>
              </thead>
              <tbody>
                {limits.map((row, idx) => (
                  <tr key={idx} className="border-b border-white/10 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-[13px] text-foreground">
                      {row.type.includes("Egress") ? (
                        <span>Concurrent <a href="#" className="text-[#00d4aa] hover:underline">Egress</a> requests</span>
                      ) : row.type.includes("Ingress") ? (
                        <span>Concurrent <a href="#" className="text-[#00d4aa] hover:underline">Ingress</a> requests</span>
                      ) : (
                        row.type
                      )}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-secondary">{row.limit}</td>
                    <td className="px-4 py-3 text-[13px] text-secondary">{row.usage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="h-px bg-white/10 mb-10" />

        {/* Danger zone Section */}
        <section>
          <h2 className="text-base font-medium text-foreground mb-1">Danger zone</h2>
          <p className="text-secondary text-[13px] mb-6">Irreversible and destructive actions</p>

          <div className="flex items-start justify-between p-4 rounded-lg border border-red-500/20 bg-red-500/5">
            <div>
              <h3 className="text-foreground text-[13px] font-medium mb-1">Delete project</h3>
              <p className="text-muted text-[12px] max-w-md">
                Deleting a project will remove all data associated with it, and cannot be undone. Please be certain before you proceed.
              </p>
            </div>
            <Button variant="danger" size="sm">
              Delete project
            </Button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
