"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { getAccessToken, getProjects, getAIConfig, updateAIConfig, Project, AIConfig } from "../../../lib/api";
import { Settings, Database, Cloud, Cpu, Save, RefreshCw } from "lucide-react";
import { cn } from "../../../lib/utils";
import { PageSkeleton } from "../../../components/ui/PageSkeleton";

export default function SettingsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    stt_mode: "cloud",
    stt_provider: "google",
    stt_model: "",
    tts_mode: "cloud",
    tts_provider: "google",
    tts_model: "",
    tts_voice: "",
    llm_mode: "cloud",
    llm_provider: "openai",
    llm_model: "",
  });

  const loadProjects = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const projectsData = await getProjects();
      setProjects(projectsData);

      const savedProjectId = localStorage.getItem("projectId");
      const project = projectsData.find((p: Project) => p.id === savedProjectId) || projectsData[0];

      if (project) {
        setCurrentProject(project);
        localStorage.setItem("projectId", project.id);
        localStorage.setItem("projectName", project.name);

        // Load AI config
        try {
          const config = await getAIConfig(project.id);
          setAiConfig({ ...config });
        } catch (e) {
          console.warn("AI config not available, using defaults");
        }
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSaveConfig = async () => {
    if (!currentProject) return;

    setSaving(true);
    try {
      await updateAIConfig(currentProject.id, aiConfig);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <>
      <Header
        projectName={currentProject?.name || "Project"}
        sectionName="Settings"
        pageName="Project Settings"
        showTimeRange={false}
        onRefresh={loadProjects}
      />

      <div className="p-6 md:p-8 space-y-8 max-w-[1200px] mx-auto animate-fade-in">
        {/* AI Configuration Section */}
        <Card className="p-6 border-border/60 shadow-sm bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">AI Configuration</h2>
              <p className="text-sm text-muted-foreground">Configure speech-to-text, text-to-speech, and LLM providers</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* STT Configuration */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Speech-to-Text (STT)</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Mode</label>
                  <select
                    value={aiConfig.stt_mode}
                    onChange={(e) => setAiConfig({ ...aiConfig, stt_mode: e.target.value })}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                  >
                    <option value="cloud">Cloud</option>
                    <option value="local">Local</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Provider</label>
                  <select
                    value={aiConfig.stt_provider}
                    onChange={(e) => setAiConfig({ ...aiConfig, stt_provider: e.target.value })}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                  >
                    <option value="google">Google Cloud</option>
                    <option value="aws">AWS</option>
                    <option value="azure">Azure</option>
                    <option value="deepgram">Deepgram</option>
                  </select>
                </div>
              </div>
            </div>

            {/* TTS Configuration */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Text-to-Speech (TTS)</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Mode</label>
                  <select
                    value={aiConfig.tts_mode}
                    onChange={(e) => setAiConfig({ ...aiConfig, tts_mode: e.target.value })}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                  >
                    <option value="cloud">Cloud</option>
                    <option value="local">Local</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Provider</label>
                  <select
                    value={aiConfig.tts_provider}
                    onChange={(e) => setAiConfig({ ...aiConfig, tts_provider: e.target.value })}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                  >
                    <option value="google">Google Cloud</option>
                    <option value="aws">AWS Polly</option>
                    <option value="azure">Azure</option>
                    <option value="elevenlabs">ElevenLabs</option>
                  </select>
                </div>
              </div>
            </div>

            {/* LLM Configuration */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Large Language Model (LLM)</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Mode</label>
                  <select
                    value={aiConfig.llm_mode}
                    onChange={(e) => setAiConfig({ ...aiConfig, llm_mode: e.target.value })}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                  >
                    <option value="cloud">Cloud</option>
                    <option value="local">Local</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Provider</label>
                  <select
                    value={aiConfig.llm_provider}
                    onChange={(e) => setAiConfig({ ...aiConfig, llm_provider: e.target.value })}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="google">Google</option>
                    <option value="local">Local (Ollama)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border/50">
              <Button
                onClick={handleSaveConfig}
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Configuration
                  </span>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Project Information */}
        <Card className="p-6 border-border/60 shadow-sm bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Project Information</h2>
              <p className="text-sm text-muted-foreground">Details about your project</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Project Name</label>
              <div className="text-sm font-medium text-foreground">{currentProject?.name || "-"}</div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Project ID</label>
              <div className="text-sm font-mono text-foreground">{currentProject?.id || "-"}</div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Status</label>
              <div className={cn(
                "text-sm font-medium inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
                currentProject?.status === "active" ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"
              )}>
                <div className={cn("w-1.5 h-1.5 rounded-full", currentProject?.status === "active" ? "bg-green-500" : "bg-muted-foreground")} />
                {currentProject?.status || "-"}
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Created</label>
              <div className="text-sm text-foreground">
                {currentProject?.created_at ? new Date(currentProject.created_at).toLocaleDateString() : "-"}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
