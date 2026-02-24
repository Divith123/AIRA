"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "../ui/Button";
import { PhoneOff, Code2, Play, Loader2 } from "lucide-react";
import { 
    LiveKitRoom, 
    useTracks,
    RoomAudioRenderer,
    AudioVisualizer
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { generateToken, getApiWebSocketBaseUrl, getAgentById, Agent } from "../../lib/api";

export default function AgentPreview() {
    const params = useParams();
    const agentId = Array.isArray(params.agentId) ? params.agentId[0] : params.agentId;
    const [agent, setAgent] = useState<Agent | null>(null);
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
    const [connection, setConnection] = useState<{ token: string; url: string } | null>(null);
    const [connecting, setConnectiong] = useState(false);

    useEffect(() => {
        if (agentId) {
            getAgentById(agentId).then(setAgent).catch(console.error);
        }
    }, [agentId]);

    const startCall = async () => {
        if (!agentId) return;
        setConnectiong(true);
        try {
            // Generate a temporary room name for testing
            const testRoomName = `test_${agentId}_${Math.random().toString(36).slice(2, 7)}`;
            const identity = `user_${Math.random().toString(36).slice(2, 7)}`;
            
            const data = await generateToken(testRoomName, identity);
            setConnection({
                token: data.token,
                url: data.ws_url || getApiWebSocketBaseUrl()
            });
        } catch (error) {
            console.error("Failed to start preview call:", error);
            alert("Failed to connect to LiveKit. Please check your configuration.");
        } finally {
            setConnectiong(false);
        }
    };

    const pythonCode = `from livekit import agents, rtc
from livekit.plugins import openai, silero

async function entrypoint(ctx: agents.JobContext):
    await ctx.connect(auto_subscribe=agents.AutoSubscribe.AUDIO_ONLY)
    
    # Agent: ${agent?.name || agentId}
    agent = agents.multimodal.MultimodalAgent(
        model=openai.realtime.RealtimeModel(
            instructions="""${agent?.instructions || "You are a helpful assistant."}""",
            modalities=["audio", "text"],
        ),
    )
    
    agent.start(ctx.room)
    await agent.say("${agent?.welcome_message || "Hello, how can I help you today?"}", allow_interruptions=True)

if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
`;

    return (
        <div className="flex flex-col h-full bg-surface relative">
            <div className="flex items-center justify-center px-4 border-b border-border/40 bg-muted/5">
                <div className="flex items-center w-full">
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`flex-1 text-[11px] font-bold uppercase tracking-widest py-3 border-b-2 transition-all ${activeTab === 'preview' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        Preview
                    </button>
                    <button
                        onClick={() => setActiveTab('code')}
                        className={`flex-1 text-[11px] font-bold uppercase tracking-widest py-3 border-b-2 transition-all ${activeTab === 'code' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        Code
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                {activeTab === 'preview' ? (
                    <div className="flex-1 flex flex-col p-8 bg-surface">
                        {connection ? (
                            <LiveKitRoom
                                serverUrl={connection.url}
                                token={connection.token}
                                connect={true}
                                audio={true}
                                video={false}
                                onDisconnected={() => setConnection(null)}
                                className="flex-1 flex flex-col items-center justify-center"
                            >
                                <RoomContent onEnd={() => setConnection(null)} />
                            </LiveKitRoom>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                                    <Play className="w-6 h-6 text-primary ml-1" />
                                </div>
                                <h3 className="text-[17px] font-bold text-foreground mb-2">Test your agent</h3>
                                <p className="text-[13px] text-muted-foreground max-w-[280px] leading-relaxed mb-10">
                                    Start a live voice session to interact with your agent using your current configuration.
                                </p>
                                <Button
                                    onClick={startCall}
                                    disabled={connecting}
                                    className="bg-primary hover:bg-primary/90 text-white font-bold text-[11px] uppercase tracking-widest px-10 py-3 h-auto shadow-xl shadow-primary/20"
                                >
                                    {connecting ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting...</>
                                    ) : "Start Test Call"}
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden flex flex-col bg-muted/5">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-surface">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                <Code2 className="w-3.5 h-3.5" />
                                agent.py
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto bg-surface font-mono text-[12px] leading-relaxed text-foreground/80 flex">
                            <div className="w-12 bg-muted/10 border-r border-border/40 flex flex-col items-center py-4 text-muted-foreground/40 select-none">
                                {[...Array(pythonCode.split('\n').length)].map((_, i) => (
                                    <div key={i} className="h-[18px]">{i + 1}</div>
                                ))}
                            </div>
                            <div className="flex-1 p-4 whitespace-pre overflow-x-auto selection:bg-primary/20 custom-scrollbar">
                                <code>{pythonCode}</code>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function RoomContent({ onEnd }: { onEnd: () => void }) {
    const tracks = useTracks([{ source: Track.Source.Microphone, withPlaceholder: false }], { onlySubscribed: false });
    const agentTracks = useTracks([{ source: Track.Source.Microphone, withPlaceholder: false }], { onlySubscribed: true });

    return (
        <div className="flex flex-col items-center w-full space-y-12">
            <RoomAudioRenderer />
            
            <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20" />
                <div className="w-32 h-32 rounded-full bg-primary/5 border-2 border-primary/20 flex items-center justify-center relative z-10 overflow-hidden">
                    <AudioVisualizer trackRef={tracks[0] as any} />
                </div>
            </div>

            <div className="text-center space-y-2">
                <p className="text-[15px] font-bold text-foreground">Agent is listening...</p>
                <p className="text-[12px] text-muted-foreground">Speak to interact with your configuration</p>
            </div>

            <Button
                variant="outline"
                onClick={onEnd}
                className="border-error/20 text-error hover:bg-error/10 font-bold text-[11px] uppercase tracking-widest px-10 py-3 h-auto transition-colors"
            >
                <PhoneOff className="w-4 h-4 mr-2" />
                End Preview
            </Button>
        </div>
    );
}
