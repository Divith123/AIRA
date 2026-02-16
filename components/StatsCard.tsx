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
        <Card variant="glass" className="p-5 h-full relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-20 transition-opacity">
                <div className="w-24 h-24 bg-primary/20 blur-[40px] rounded-full" />
            </div>
            <div className="flex items-center justify-between mb-6 relative z-10">
                <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{label}</span>
                <InfoIcon className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
            </div>
            <div className="flex items-center justify-center py-2 relative z-10 min-h-[60px]">
                {empty ? (
                    <span className="text-muted-foreground/60 text-xs italic">No data available</span>
                ) : (
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-3xl font-display font-bold text-foreground">{value}</div>
                        {subValue && <div className="text-xs text-muted-foreground">{subValue}</div>}
                    </div>
                )}
                {chart}
            </div>
        </Card>
    );
}
