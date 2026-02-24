import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    error?: boolean;
    label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, startIcon, endIcon, error, label, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-[13px] font-medium text-foreground mb-2">
                        {label}
                    </label>
                )}
                <div className="relative w-full group">
                    {startIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
                            {startIcon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            "flex h-12 w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50",
                            startIcon ? "pl-10" : "",
                            endIcon ? "pr-10" : "",
                            error && "border-error focus-visible:ring-error/50",
                            "hover:border-border/60 hover:bg-surface-hover",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                    {endIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {endIcon}
                        </div>
                    )}
                </div>
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
