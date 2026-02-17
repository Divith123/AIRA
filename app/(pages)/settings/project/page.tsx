"use client";

import React, { useState, useEffect } from "react";
// DashboardLayout removed
import Header from "../../../components/Header";
import { Button } from "../../../../components/ui/Button";
import { Card } from "../../../../components/ui/Card";
import { AiraLoader } from "../../../../components/ui/AiraLoader";
import { Save, Trash2, Info, Database, ExternalLink, Settings, Shield, Zap, BarChart, AlertTriangle, ChevronRight } from "lucide-react";
import { getProject, getProjects, updateProject } from "../../../../lib/api";

interface ProjectSettingsPageProps {
  projectId?: string;
}

export default function ProjectSettingsPage({ projectId }: ProjectSettingsPageProps) {
  const [apiProjectId, setApiProjectId] = useState<string | null>(null);
  const [displayProjectId, setDisplayProjectId] = useState<string>("");
  const [name, setName] = useState("Default Project");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [autoCreateName, setAutoCreateName] = useState(true);
  const [adminCanCreateCodec, setAdminCanCreateCodec] = useState(true);
  const [allowPendingUnverified, setAllowPendingUnverified] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [enabledCodecs, setEnabledCodecs] = useState({
    opus: true,
    aac: true,
    ulaw: true,
    vp8: false,
    art: false,
  });

  const handleSave = () => {
    if (!apiProjectId) return;
    setSaving(true);
    (async () => {
      try {
        const updated = await updateProject(apiProjectId, name, description);
        setName(updated.name);
        setDescription(updated.description || "");
      } catch (err) {
        console.error("Failed to save project", err);
      } finally {
        setSaving(false);
      }
    })();
  };

  useEffect(() => {
    // Resolve project id from route/localStorage (may be short_id or full id)
    (async () => {
      try {
        const stored = typeof window !== "undefined" ? localStorage.getItem("projectId") : null;

        // Fetch projects to map short_id -> id if needed
        const projects = await getProjects();

        let resolvedApiId: string | undefined;
        let displayId = "";

        if (projectId) {
          const routeMatch = projects.find((x) => x.short_id === projectId || x.id === projectId);
          if (routeMatch) {
            resolvedApiId = routeMatch.id;
            displayId = routeMatch.short_id || routeMatch.id;
          }
        }

        if (!resolvedApiId && stored) {
          const match = projects.find((x) => x.short_id === stored || x.id === stored);
          if (match) {
            resolvedApiId = match.id;
            displayId = match.short_id || match.id;
          }
        }

        if (!resolvedApiId && projects.length > 0) {
          resolvedApiId = projects[0].id;
          displayId = projects[0].short_id || projects[0].id;
        }

        if (resolvedApiId) {
          setApiProjectId(resolvedApiId);
          setDisplayProjectId(displayId);
          if (typeof window !== "undefined") {
            localStorage.setItem("projectId", resolvedApiId);
          }
          try {
            const p = await getProject(resolvedApiId);
            setName(p.name || "");
            setDescription(p.description || "");
          } catch (e) {
            console.warn("Failed to load project details", e);
          }
        }
      } catch (e) {
        console.warn("Failed to resolve project", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  return (
    <>
      {(loading || saving) && <AiraLoader />}
      <Header
        projectName={name || "Project"}
        pageName="Project Settings"
        showTimeRange={false}
        actionButton={
          <Button 
            size="sm" 
            leftIcon={<Save className="w-4 h-4" />} 
            onClick={handleSave} 
            isLoading={saving}
          >
            Save Changes
          </Button>
        }
      />

      <div className="p-4 md:p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <main className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Project settings</h2>
              <p className="text-muted-foreground">Manage project identity and configuration.</p>
            </div>

            <Card className="p-6 border-border/40 bg-white dark:bg-surface/30">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Project name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 px-3 rounded-md bg-white dark:bg-muted/20 border border-border text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Project ID</label>
                    <input
                      type="text"
                      value={displayProjectId}
                      readOnly
                      className="w-full h-10 px-3 rounded-md bg-gray-50 dark:bg-muted/10 border border-border text-xs text-muted-foreground font-mono cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border/40 bg-white dark:bg-surface/30">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Enabled codecs</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.keys(enabledCodecs).map((codec) => (
                  <label key={codec} className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabledCodecs[codec as keyof typeof enabledCodecs]}
                      onChange={(e) => setEnabledCodecs({...enabledCodecs, [codec]: e.target.checked})}
                      className="w-4 h-4 rounded border-border bg-white dark:bg-muted/20 text-primary"
                    />
                    <span className="uppercase">{codec === 'art' ? 'AV1' : codec}</span>
                  </label>
                ))}
              </div>
            </Card>

            <Card className="p-0 border-border/40 bg-white dark:bg-surface/30 overflow-hidden">
              <div className="p-6 border-b border-border/40">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Connection limits</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-gray-50 dark:bg-muted/20">
                      <th className="text-left px-6 py-4 text-muted-foreground text-xs font-semibold uppercase tracking-wider">TYPE</th>
                      <th className="text-left px-6 py-4 text-muted-foreground text-xs font-semibold uppercase tracking-wider">LIMIT</th>
                      <th className="text-left px-6 py-4 text-muted-foreground text-xs font-semibold uppercase tracking-wider">PEAK USAGE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {[
                      { label: 'Concurrent participants', value: 'Unlimited' },
                      { label: 'Concurrent room sessions', value: 'Unlimited' },
                      { label: 'Concurrent ingress requests', value: 'Unlimited' },
                      { label: 'Concurrent SIP sessions', value: 'Unlimited' },
                    ].map((limit) => (
                      <tr key={limit.label} className="hover:bg-gray-50 dark:hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4 text-foreground">{limit.label}</td>
                        <td className="px-6 py-4 text-foreground font-medium">{limit.value}</td>
                        <td className="px-6 py-4 text-muted-foreground">0</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-6 border border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5">
              <h3 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-1">Danger zone</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Deleting a project will remove all data associated with it and cannot be undone.
              </p>
              <Button 
                variant="danger" 
                size="sm"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => {
                  if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
                    // console.log("Delete project");
                  }
                }}
              >
                Delete project
              </Button>
            </Card>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            <Card className="p-5 border-border/60 bg-linear-to-br from-white to-gray-50/50 dark:from-surface/40 dark:to-surface/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Project Overview</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-border/30 pb-2">
                  <span className="text-muted-foreground">Status</span>
                  <div className="flex items-center gap-1.5 font-medium text-green-500">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Active
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-border/30 pb-2">
                  <span className="text-muted-foreground">Project ID</span>
                  <span className="font-mono text-foreground text-xs">{displayProjectId || "—"}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-border/30 pb-2">
                  <span className="text-muted-foreground">Stability</span>
                  <span className="text-foreground">99.9%</span>
                </div>
              </div>
            </Card>

            <Card className="p-5 border-border/60">
              <h3 className="text-sm font-semibold text-foreground mb-4">Internal Notes</h3>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                Changes to codecs or connection limits may affect existing sessions. This project is residency-locked to the cloud region.
              </p>
            </Card>

            <Card className="p-5 border-border/60">
              <h3 className="text-sm font-semibold text-foreground mb-4">Quick Links</h3>
              <div className="space-y-3">
                <a href="#" className="flex items-center gap-2 group text-sm text-muted-foreground hover:text-primary transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  <span>Developer portal</span>
                </a>
                <a href="#" className="flex items-center gap-2 group text-sm text-muted-foreground hover:text-primary transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  <span>LiveKit documentation</span>
                </a>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}
