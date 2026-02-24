import React from "react";
import { InfoIcon } from "../app/components/icons";
import { Card } from "./ui/Card";

interface StatsCardProps {
    label: string;
    value?: string | number;
    subValue?: string;
    chart?: React.ReactNode;
    empty?: boolean;
}

export function StatsCard({ label, value, subValue, chart, empty = false }: StatsCardProps) {
    return (
        <Card variant="glass" className="p-4 h-full relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-20 transition-opacity">
                <div className="w-16 h-16 bg-primary/20 blur-[30px] rounded-full" />
            </div>
            <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">{label}</span>
                <InfoIcon className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
            </div>
            <div className="flex items-center justify-center py-1 relative z-10 min-h-[40px]">
                {empty ? (
                    <span className="text-muted-foreground/60 text-[10px] italic">No data</span>
                ) : (
                    <div className="flex flex-col items-center gap-0.5">
                        <div className="text-2xl font-display font-black text-foreground leading-none">{value}</div>
                        {subValue && <div className="text-[10px] text-muted-foreground font-medium">{subValue}</div>}
                    </div>
                )}
                {chart}
            </div>
        </Card>
    );
}
