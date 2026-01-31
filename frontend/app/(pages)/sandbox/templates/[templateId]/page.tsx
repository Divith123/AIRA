"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "../../../../components/layouts/DashboardLayout";
import Header from "../../../components/Header";
import { Button } from "../../../../components/ui/Button";
import { ArrowLeftIcon } from "../../../components/icons";

export default function SandboxTemplatePage() {
    const router = useRouter();
    const params = useParams();
    const templateId = params?.templateId as string;

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
        <DashboardLayout user={user}>
            <Header
                projectName={projectName}
                pageName="Templates"
                showTimeRange={false}
            />

            <div className="p-8 max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-secondary hover:text-foreground transition-colors mb-6"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back to templates
                </button>

                <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
                    {/* Hero Image Placeholder */}
                    <div className="h-64 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex items-center justify-center border-b border-white/10">
                        <div className="text-center p-8">
                            <div className="w-20 h-20 bg-white/10 rounded-2xl mx-auto mb-4 flex items-center justify-center backdrop-blur-md">
                                <span className="text-4xl">🎙️</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-foreground mb-2">Web Voice Agent</h1>
                                <p className="text-secondary text-sm mb-4">A simple web voice agent that uses OpenAI and Deepgram.</p>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">Next.js</span>
                                    <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">OpenAI</span>
                                    <span className="px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium border border-purple-500/20">Deepgram</span>
                                </div>
                            </div>
                            <Button
                                size="lg"
                                className="bg-[#00d4aa] text-black hover:bg-[#00e5c0]"
                                onClick={() => console.log("Clone template")}
                            >
                                Use template
                            </Button>
                        </div>

                        <div className="h-px bg-white/10 my-8" />

                        <div className="grid grid-cols-3 gap-8">
                            <div className="col-span-2 space-y-8">
                                <div>
                                    <h3 className="text-lg font-medium text-foreground mb-3">Description</h3>
                                    <p className="text-secondary text-sm leading-relaxed">
                                        This template demonstrates how to build a voice agent using Vercel's AI SDK, LiveKit, Next.js, and OpenAI. It includes a complete frontend interface for interacting with the agent and a backend for handling token generation and agent logic.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-foreground mb-3">Features</h3>
                                    <ul className="list-disc list-inside text-secondary text-sm space-y-2">
                                        <li>Real-time voice interaction using WebRTC</li>
                                        <li>Streaming text-to-speech and speech-to-text</li>
                                        <li>Context-aware conversation handling</li>
                                        <li>Modern Next.js App Router structure</li>
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-foreground mb-4 uppercase tracking-wider">Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <span className="block text-xs text-secondary mb-1">Created by</span>
                                        <span className="text-sm text-foreground font-medium">LiveKit Team</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-secondary mb-1">Last updated</span>
                                        <span className="text-sm text-foreground font-medium">2 days ago</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-secondary mb-1">License</span>
                                        <span className="text-sm text-foreground font-medium">MIT</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
