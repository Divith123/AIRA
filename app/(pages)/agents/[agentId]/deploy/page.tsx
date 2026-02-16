"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Copy, Check, Terminal, Cpu, Play } from "lucide-react";
import { Button } from "../../../../../components/ui/Button";
import { Card } from "../../../../../components/ui/Card";
import { deployAgent, type DeployAgentResponse, getProjects } from "../../../../../lib/api";

type TabId = "process" | "cli";

const TAB_OPTIONS: Array<{ id: TabId; name: string }> = [
  { id: "process", name: "Process" },
  { id: "cli", name: "LiveKit CLI" },
];

const PROCESS_TEMPLATE = `# Run your agent as a managed OS process (recommended)

# 1) Install runtime dependencies
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt

# 2) Configure environment
export LIVEKIT_URL=wss://your-livekit-host
export LIVEKIT_API_KEY=your-api-key
export LIVEKIT_API_SECRET=your-api-secret
export OPENAI_API_KEY=your-openai-key

# 3) Start the worker process
python main.py start

# Optional: systemd unit (/etc/systemd/system/livekit-agent.service)
[Unit]
Description=LiveKit Agent Worker
After=network.target

[Service]
WorkingDirectory=/opt/livekit-agent
ExecStart=/opt/livekit-agent/.venv/bin/python main.py start
Restart=always
RestartSec=5
Environment=LIVEKIT_URL=wss://your-livekit-host
Environment=LIVEKIT_API_KEY=your-api-key
Environment=LIVEKIT_API_SECRET=your-api-secret

[Install]
WantedBy=multi-user.target
`;

const CLI_TEMPLATE = `# Install LiveKit CLI
npm install -g @livekit/cli

# Authenticate
lk auth --url ws://localhost:7880 --api-key YOUR_API_KEY --api-secret YOUR_API_SECRET

# Create agent scaffold
lk app create my-agent --template voice-pipeline-agent
cd my-agent

# Configure and run
pip install -r requirements.txt
python main.py dev

# Deploy managed worker
lk agent deploy --name my-agent --replicas 2
`;

const PYTHON_AGENT_TEMPLATE = `"""
Minimal LiveKit voice agent worker
"""

from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, cli
from livekit.plugins import openai, silero


class VoiceAssistant(Agent):
    def __init__(self):
        super().__init__(instructions="You are a concise voice assistant.")


async def entrypoint(ctx: JobContext):
    await ctx.connect()
    participant = await ctx.wait_for_participant()

    session = AgentSession(
        vad=silero.VAD.load(),
        stt=openai.STT(model="whisper-1"),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=openai.TTS(model="tts-1", voice="alloy"),
    )

    await session.start(
        agent=VoiceAssistant(),
        room=ctx.room,
        participant=participant,
    )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
`;

const REQUIREMENTS_TEMPLATE = `livekit-agents>=0.12.0
livekit-plugins-openai>=0.10.0
livekit-plugins-silero>=0.7.0
python-dotenv>=1.0.0
`;

export default function DeployAgentPage() {
  const params = useParams();
  const agentId = String(params.agentId || "");

  const [activeTab, setActiveTab] = useState<TabId>("process");
  const [copied, setCopied] = useState<string | null>(null);
  const [projectId, setProjectId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<DeployAgentResponse | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);

  useEffect(() => {
    const hydrateProject = async () => {
      const storedProjectId = localStorage.getItem("projectId") || "";
      if (storedProjectId) {
        setProjectId(storedProjectId);
        return;
      }

      try {
        const projects = await getProjects();
        const fallback = projects[0]?.id || "";
        if (fallback) {
          localStorage.setItem("projectId", fallback);
          setProjectId(fallback);
        }
      } catch {
        setProjectId("");
      }
    };

    hydrateProject();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDeployNow = async () => {
    if (!projectId) {
      setDeployError("Project context is missing. Select a project and try again.");
      return;
    }

    setDeploying(true);
    setDeployError(null);
    setDeployResult(null);

    try {
      const result = await deployAgent(projectId, agentId, {
        deployment_type: "process",
        room_name: roomName.trim() || undefined,
      });
      setDeployResult(result);
    } catch (error) {
      setDeployError(error instanceof Error ? error.message : "Failed to deploy agent");
    } finally {
      setDeploying(false);
    }
  };

  const templateName = activeTab === "process" ? "process-deploy.sh" : "livekit-cli.sh";
  const templateContent = activeTab === "process" ? PROCESS_TEMPLATE : CLI_TEMPLATE;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Deploy Agent</h2>
          <p className="text-muted-foreground text-[13px] mt-1">
            Process-only deployment for self-hosted worker runtime.
          </p>
        </div>

        <div className="flex bg-muted/30 p-1 rounded-xl border border-border/60">
          {TAB_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setActiveTab(option.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === option.id
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

          <Card className="p-6 border-border/60 shadow-sm bg-card">
        <h3 className="text-sm font-bold text-foreground mb-4">Deploy To Self-Hosted LiveKit</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Deployment Type
            </label>
            <div className="w-full bg-surface border border-border/60 rounded-lg px-3 py-2.5 text-sm">
              process
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Room (Optional)
            </label>
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="support-room-01"
              className="w-full bg-surface border border-border/60 rounded-lg px-3 py-2.5 text-sm"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleDeployNow}
              disabled={deploying || !projectId}
              className="w-full bg-[oklch(0.627_0.265_273.15)] hover:bg-[oklch(0.55_0.25_273.15)] text-white"
              leftIcon={<Play className="w-4 h-4" />}
            >
              {deploying ? "Deploying..." : "Deploy Now"}
            </Button>
          </div>
        </div>

        {!projectId && (
          <p className="text-xs text-amber-500 mt-3">No active project selected. Choose a project first.</p>
        )}
        {deployError && <p className="text-xs text-red-500 mt-3">{deployError}</p>}

        {deployResult && (
          <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs space-y-1">
            <div>
              <strong>Status:</strong> {deployResult.status}
            </div>
            <div>
              <strong>Instance ID:</strong> {deployResult.instance_id}
            </div>
            {deployResult.process_pid && (
              <div>
                <strong>PID:</strong> {deployResult.process_pid}
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Terminal className="w-4 h-4 text-primary" />
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Deployment Template
            </h3>
          </div>

          <Card className="p-0 overflow-hidden border-border/60 shadow-sm bg-card group">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/5">
              <span className="text-[11px] font-mono text-muted-foreground/60 uppercase">{templateName}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-[11px] font-bold text-white/40 hover:text-primary hover:bg-primary/10 uppercase"
                onClick={() => handleCopy(templateContent, "main")}
              >
                {copied === "main" ? <Check className="w-3.5 h-3.5 mr-2" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
                {copied === "main" ? "Copied!" : "Copy"}
              </Button>
            </div>

            <div className="relative">
              <pre className="p-6 text-[13px] text-white/80 overflow-x-auto font-mono leading-relaxed max-h-[600px] overflow-y-auto selection:bg-primary/30">
                <code>{templateContent}</code>
              </pre>
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <Cpu className="w-4 h-4 text-primary" />
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Boilerplate Logic</h3>
          </div>

          <div className="space-y-4">
            <Card className="p-0 overflow-hidden border-border/60 shadow-sm bg-card">
              <div className="flex items-center justify-between px-6 py-3 border-b border-border/40 bg-muted/5">
                <span className="text-[11px] font-mono text-muted-foreground/40">main.py</span>
                <button
                  className="text-[11px] font-bold text-muted-foreground/60 hover:text-primary transition-colors uppercase tracking-widest"
                  onClick={() => handleCopy(PYTHON_AGENT_TEMPLATE, "mainpy")}
                >
                  {copied === "mainpy" ? "Copied!" : "Copy File"}
                </button>
              </div>
              <pre className="p-5 text-[12px] text-foreground overflow-x-auto font-mono max-h-[250px] overflow-y-auto leading-relaxed">
                <code>{PYTHON_AGENT_TEMPLATE}</code>
              </pre>
            </Card>

            <Card className="p-0 overflow-hidden border-border/60 shadow-sm bg-card">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
                <span className="text-[10px] font-mono text-muted-foreground/40">requirements.txt</span>
                <button onClick={() => handleCopy(REQUIREMENTS_TEMPLATE, "requirements")}> 
                  <Copy className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-primary" />
                </button>
              </div>
              <pre className="p-4 text-[11px] text-foreground overflow-x-auto font-mono max-h-[180px] overflow-y-auto">
                <code>{REQUIREMENTS_TEMPLATE}</code>
              </pre>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
