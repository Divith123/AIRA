import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/guards";
import { livekit } from "@/lib/server/livekit";

export async function GET(request: NextRequest) {
  const claims = requireAuth(request);
  if (claims instanceof NextResponse) return claims;

  const started = Date.now();

  const serviceStatus: {
    [key: string]: {
      status: string;
      latency_ms: number;
      details?: string;
      error?: string;
      rooms?: number;
    };
  } = {};

  const dbStart = Date.now();
  try {
    await query("SELECT 1");
    serviceStatus.database = {
      status: "healthy",
      latency_ms: Date.now() - dbStart,
    };
  } catch (error) {
    serviceStatus.database = {
      status: "unhealthy",
      latency_ms: Date.now() - dbStart,
      error: error instanceof Error ? error.message : "db_error",
    };
  }

  const lkStart = Date.now();
  try {
    const rooms = await livekit.room.listRooms();
    serviceStatus.livekit = {
      status: "healthy",
      latency_ms: Date.now() - lkStart,
      rooms: rooms.length,
    };
  } catch (error) {
    serviceStatus.livekit = {
      status: "unhealthy",
      latency_ms: Date.now() - lkStart,
      error: error instanceof Error ? error.message : "livekit_error",
    };
  }

  const overall =
    Object.values(serviceStatus).every((service) => service.status === "healthy")
      ? "healthy"
      : "degraded";

  return NextResponse.json({
    status: overall,
    timestamp: new Date().toISOString(),
    services: serviceStatus,
    latency_ms: Date.now() - started,
  });
}

