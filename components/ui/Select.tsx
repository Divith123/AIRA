"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

interface SelectOption {
    label: string;
    value: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: SelectOption[];
    error?: string;
}

export function Select({ label, options, error, className = "", ...props }: SelectProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-[13px] font-medium text-foreground mb-2">
                    {label}
                </label>
            )}
            <div className="relative group">
                <select
                    className={`w-full appearance-none bg-surface text-foreground border border-border/60 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-all cursor-pointer hover:bg-muted/5 hover:border-border/40 glass ${error
                        ? "border-error focus:border-error"
                        : ""
                        } ${className}`}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value} className="bg-background text-foreground py-2">
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-foreground transition-colors">
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>
            {error && <p className="mt-1 text-xs text-error">{error}</p>}
        </div>
    );
}
