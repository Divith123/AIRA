import { NextResponse } from "next/server";
import { query } from "@/lib/server/db";
import { livekit } from "@/lib/server/livekit";

export async function GET() {
  const timestamp = new Date().toISOString();

  let db = "healthy";
  try {
    await query("SELECT 1");
  } catch {
    db = "unhealthy";
  }

  let lk = "healthy";
  try {
    await livekit.room.listRooms();
  } catch {
    lk = "unhealthy";
  }

  const status = db === "healthy" && lk === "healthy" ? "healthy" : "degraded";
  return NextResponse.json({
    status,
    timestamp,
    services: {
      database: db,
      livekit: lk,
    },
    uptime_seconds: 0,
  });
}

