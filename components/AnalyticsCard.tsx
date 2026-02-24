"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AnalyticsCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    headerAction?: React.ReactNode;
}

export function AnalyticsCard({ title, children, className, headerAction }: AnalyticsCardProps) {
    return (
        <div className={cn("relative rounded-xl border border-border bg-surface/50 overflow-hidden group text-foreground", className)}>
            <div className="absolute inset-0 bg-primary/[0.01] pointer-events-none" />

            <div className="flex items-center justify-between px-3.5 py-2 border-b border-border">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    {title}
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/30 group-hover:bg-primary/50 transition-colors" />
                </h3>
                {headerAction}
            </div>

            <div className="p-3 relative z-10">
                {children}
            </div>
        </div>
    );
}
