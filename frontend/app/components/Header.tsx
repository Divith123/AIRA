"use client";

import React from "react";
import { ClockIcon, RefreshCwIcon, CalendarIcon, ChevronDownIcon } from "./icons";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
  projectName: string;
  pageName: string;
  showTimeRange?: boolean;
  actionButton?: React.ReactNode;
}

export default function Header({ projectName, pageName, showTimeRange = true, actionButton }: HeaderProps) {
  return (
    <header className="h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-xl border-b border-white/5 z-20 transition-all">
      <div className="flex items-center gap-3 text-sm overflow-hidden">
        <div className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-muted-foreground whitespace-nowrap hidden sm:block font-medium">
          {projectName}
        </div>
        <span className="text-muted-foreground hidden sm:block">/</span>
        <h1 className="text-foreground font-display font-semibold truncate text-base">{pageName}</h1>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {showTimeRange && (
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-white/10 text-muted-foreground text-xs shadow-sm">
              <ClockIcon className="w-3.5 h-3.5" />
              <span>Updated now</span>
            </div>

            <Button variant="outline" size="sm" className="hidden md:flex h-8 gap-2 bg-surface border-white/10 text-muted-foreground hover:text-foreground text-xs font-normal">
              <RefreshCwIcon className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Auto-refresh</span>
              <ChevronDownIcon className="w-3.5 h-3.5 ml-1 opacity-50" />
            </Button>

            <Button variant="outline" size="sm" className="flex h-8 gap-2 bg-surface border-white/10 text-muted-foreground hover:text-foreground text-xs font-normal">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Past 24h</span>
              <ChevronDownIcon className="w-3.5 h-3.5 ml-1 opacity-50" />
            </Button>
          </div>
        )}
        {actionButton && (
          <div className="border-l border-white/10 pl-3 ml-1">
            {actionButton}
          </div>
        )}
      </div>
    </header>
  );
}
