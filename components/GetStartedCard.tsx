"use client";

import React from "react";
import { Button } from "./ui/Button";
import { ChevronRightIcon } from "../app/components/icons";

interface GetStartedCardProps {
    title?: string;
    description?: string;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    onPrimaryClick?: () => void;
    onSecondaryClick?: () => void;
}

export function GetStartedCard({
    title = "Welcome to your dashboard",
    description = "Get started by creating your first agent, or explore our documentation to learn more about what you can build.",
    primaryButtonText = "Create Agent",
    secondaryButtonText = "Read Documentation",
    onPrimaryClick,
    onSecondaryClick
}: GetStartedCardProps) {
    return (
        <div className="p-6 rounded-lg bg-gradient-to-br from-surface to-surface-hover border border-white/[0.06] mb-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
                    <p className="text-secondary text-sm max-w-lg mb-6">
                        {description}
                    </p>
                    <div className="flex items-center gap-3">
                        <Button rightIcon={<ChevronRightIcon className="w-4 h-4" />} onClick={onPrimaryClick}>
                            {primaryButtonText}
                        </Button>
                        <Button onClick={onSecondaryClick}>
                            {secondaryButtonText}
                        </Button>
                    </div>
                </div>
                <div className="hidden lg:block w-32 h-32 opacity-20 bg-primary rounded-full blur-3xl"></div>
            </div>
        </div>
    );
}
