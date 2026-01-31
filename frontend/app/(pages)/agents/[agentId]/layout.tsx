"use client";

import React, { useState, useEffect } from "react";
import AgentLayout from "../../../../components/agent/AgentLayout";
import { useRouter } from "next/navigation";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
            return;
        }
        setUser(JSON.parse(storedUser));
    }, [router]);

    if (!user) return null;

    // React.use() wrapper to unwrap params in Next.js 15+ if needed, 
    // but for standard client component usage we can use them directly or via hook.
    // Since this is a client component layout, props are passed.

    return (
        <AgentLayout user={user}>
            {children}
        </AgentLayout>
    );
}
