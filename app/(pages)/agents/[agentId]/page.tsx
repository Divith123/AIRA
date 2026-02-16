"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function AgentRootPage() {
    const router = useRouter();
    const params = useParams();
    const agentId = Array.isArray(params.agentId) ? params.agentId[0] : params.agentId;

    useEffect(() => {
        // Redirect to overview by default
        if (agentId) {
            router.replace(`/agents/${agentId}/instructions`);
        }
        // NOTE: Based on screenshot, "Instructions" seems to be the default "Edit" view, 
        // but typically "Overview" is first. 
        // Screenshot 1 is "Instructions".
        // Let's redirect to Instructions as it's the main builder view.
    }, [agentId, router]);

    return null;
}
