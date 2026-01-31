import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

const cardVariants = cva(
    "rounded-xl border transition-all duration-300 overflow-hidden",
    {
        variants: {
            variant: {
                default: "bg-surface border-white/5 shadow-xl text-foreground",
                glass: "glass-card text-foreground",
                outline: "border-border bg-transparent text-foreground",
                gradient: "bg-gradient-to-br from-surface to-background border-white/5",
            },
            hoverEffect: {
                true: "hover:translate-y-[-4px] hover:shadow-2xl hover:border-white/10 glass-hover",
                false: "",
            },
            padding: {
                none: "p-0",
                sm: "p-4",
                md: "p-6",
                lg: "p-8",
            }
        },
        defaultVariants: {
            variant: "glass",
            hoverEffect: false,
            padding: "md",
        },
    }
);

export interface CardProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> { }

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant, hoverEffect, padding, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(cardVariants({ variant, hoverEffect, padding, className }))}
                {...props}
            />
        );
    }
);
Card.displayName = "Card";

export { Card, cardVariants, cn };
