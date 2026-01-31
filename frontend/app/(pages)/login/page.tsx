"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function SSOIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3L22 7l-3-3" />
    </svg>
  );
}

function RelatimLogo() {
  return (
    <svg viewBox="0 0 48 48" className="w-16 h-16 drop-shadow-xl">
      <defs>
        <linearGradient id="rGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="48" height="48" rx="16" fill="url(#rGrad)" className="animate-pulse-slow" />
      <text
        x="24"
        y="34"
        textAnchor="middle"
        fill="white"
        fontSize="32"
        fontWeight="bold"
        fontFamily="Outfit, sans-serif"
      >
        R
      </text>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleLogin = (provider: string) => {
    setLoading(provider);
    setTimeout(() => {
      localStorage.setItem("user", JSON.stringify({ provider, name: "Demo User", email: "demo@example.com" }));
      router.push("/welcome/step1");
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-background z-0" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse-slow delay-1000" />

      <Card variant="glass" className="w-full max-w-md p-8 relative z-10 border-white/5 animate-slide-up bg-black/40">
        <div className="flex flex-col items-center text-center mb-8">
          <RelatimLogo />
          <h1 className="text-3xl font-display font-bold tracking-tight mt-6 text-foreground bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Welcome back
          </h1>
          <p className="text-muted-foreground text-sm mt-3 px-4">
            Sign in to your account to continue building the future with <span className="text-primary font-medium">Relatim Cloud</span>
          </p>
        </div>

        <div className="space-y-3">
          <Button
            variant="glass"
            className="w-full h-12 justify-start px-4 text-base font-normal group relative overflow-hidden transition-all duration-300 hover:border-primary/30 hover:bg-white/5"
            leftIcon={<GoogleIcon />}
            onClick={() => handleLogin("google")}
            isLoading={loading === "google"}
          >
            <span className="flex-1 text-center group-hover:text-primary transition-colors">Continue with Google</span>
          </Button>

          <Button
            variant="glass"
            className="w-full h-12 justify-start px-4 text-base font-normal group relative overflow-hidden transition-all duration-300 hover:border-primary/30 hover:bg-white/5"
            leftIcon={<GitHubIcon />}
            onClick={() => handleLogin("github")}
            isLoading={loading === "github"}
          >
            <span className="flex-1 text-center group-hover:text-primary transition-colors">Continue with GitHub</span>
          </Button>

          <Button
            variant="glass"
            className="w-full h-12 justify-start px-4 text-base font-normal group relative overflow-hidden transition-all duration-300 hover:border-primary/30 hover:bg-white/5"
            leftIcon={<SSOIcon />}
            onClick={() => handleLogin("sso")}
            isLoading={loading === "sso"}
          >
            <span className="flex-1 text-center group-hover:text-primary transition-colors">Continue with SSO</span>
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="#" className="underline hover:text-primary transition-colors">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="underline hover:text-primary transition-colors">Privacy Policy</a>.
          </p>
        </div>
      </Card>
    </div>
  );
}
