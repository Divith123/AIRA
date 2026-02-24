"use client";

import React from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

export function StatsLineChart({ data, dataKey = "value", color = "var(--primary)" }: { data: any[]; dataKey?: string; color?: string }) {
    const hasData = data && data.length > 1;

    if (!hasData) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center space-y-3 bg-surface/50 rounded-xl border border-dashed border-border/60">
                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                </div>
                <div className="text-center">
                    <div className="text-[11px] font-bold text-foreground uppercase tracking-wider">Awaiting Time-series Data</div>
                    <div className="text-[10px] text-muted-foreground">Trends will appear as sessions are recorded over time.</div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full relative group">
            <div className="absolute top-0 right-0 flex items-center gap-2 z-10">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-success/10 border border-success/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] font-bold text-success uppercase tracking-widest">Live</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.3} />
                    <XAxis
                        dataKey="timestamp"
                        stroke="var(--muted-foreground)"
                        fontSize={10}
                        tickFormatter={(value) => {
                            try {
                                return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            } catch {
                                return value;
                            }
                        }}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        stroke="var(--muted-foreground)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "var(--surface)",
                            borderColor: "var(--border)",
                            borderRadius: "12px",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                            border: "1px solid var(--border)",
                            padding: "12px"
                        }}
                        itemStyle={{ color: color, fontSize: "14px", fontWeight: "800" }}
                        labelStyle={{ color: "var(--muted-foreground)", marginBottom: "8px", fontSize: "10px", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "1px" }}
                        labelFormatter={(label) => new Date(label).toLocaleString()}
                        cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "4 4" }}
                    />
                    <Area
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        strokeWidth={3}
                        fill={`url(#gradient-${dataKey})`}
                        animationDuration={2000}
                        activeDot={{ r: 6, fill: color, stroke: "var(--background)", strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export function DonutChart({ data }: { data: { name: string; value: number }[] }) {
    const COLORS = ["var(--primary)", "var(--accent)", "var(--success)", "var(--warning)", "var(--error)"];

    // Filter out zero values for the chart but keep for the legend
    const chartData = data.filter(d => d.value > 0);
    const hasData = chartData.length > 0 && chartData[0].name !== "No Data";

    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-1 h-[120px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={hasData ? chartData : [{ name: "No Data", value: 100 }]}
                            cx="50%"
                            cy="50%"
                            innerRadius="75%"
                            outerRadius="95%"
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                            animationBegin={0}
                            animationDuration={1500}
                        >
                            {hasData ? chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            )) : (
                                <Cell fill="var(--border)" />
                            )}
                        </Pie>
                        {hasData && (
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "var(--surface)",
                                    borderColor: "var(--border)",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    padding: "4px 8px"
                                }}
                                itemStyle={{ color: "var(--foreground)", fontSize: "10px" }}
                            />
                        )}
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Display */}
                <div className="absolute inset-0 flex flex-col pointer-events-none items-center justify-center">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Total</span>
                    <span className="text-lg font-black text-foreground -mt-0.5">
                        {hasData ? data.reduce((acc, curr) => acc + curr.value, 0) : 0}%
                    </span>
                </div>
            </div>

            {/* Compact Legend Below */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 px-1">
                {data.map((entry, index) => {
                    const color = entry.name === "No Data" ? "var(--border)" : COLORS[index % COLORS.length];
                    return (
                        <div key={entry.name} className="flex items-center gap-1.5 group transition-all">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                            <div className="flex justify-between w-full items-center">
                                <span className="text-[10px] text-muted-foreground truncate group-hover:text-foreground transition-colors">{entry.name}</span>
                                <span className="text-[10px] font-extrabold text-foreground ml-1.5">{entry.value}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
