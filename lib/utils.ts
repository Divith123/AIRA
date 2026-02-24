import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function parseRangeToHours(range: string | null): number {
    switch ((range || "24h").toLowerCase()) {
        case "1h":
            return 1;
        case "3h":
            return 3;
        case "6h":
            return 6;
        case "12h":
            return 12;
        case "24h":
            return 24;
        case "7d":
            return 24 * 7;
        case "30d":
            return 24 * 30;
        case "60d":
            return 24 * 60;
        default:
            return 24;
    }
}

export function parseSessionFeatures(features: string | null): string[] {
    if (!features) return [];
    try {
        const parsed = JSON.parse(features) as unknown;
        if (Array.isArray(parsed)) {
            return parsed.map((item) => String(item));
        }
    } catch {
        // Ignore invalid serialized features.
    }
    return [];
}

export function extractProjectIdFromRoom(roomName: string): string | null {
    if (!roomName.startsWith("prj-")) return null;
    const rest = roomName.slice(4);
    const lastDash = roomName.lastIndexOf("-");
    if (lastDash <= 4) return null;
    return roomName.slice(4, lastDash);
}
