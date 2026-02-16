import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/guards";
import { livekit } from "@/lib/server/livekit";

export async function GET(request: NextRequest) {
  const claims = requireAuth(request);
  if (claims instanceof NextResponse) return claims;

  const timestamp = new Date().toISOString();

  let rooms = 0;
  let participants = 0;
  let livekitConnected = false;
  try {
    const listed = await livekit.room.listRooms();
    rooms = listed.length;
    participants = listed.reduce((acc, room) => acc + room.numParticipants, 0);
    livekitConnected = true;
  } catch {
    livekitConnected = false;
  }

  let dbConnected = false;
  try {
    await query("SELECT 1");
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  return NextResponse.json({
    timestamp,
    uptime_seconds: 0,
    version: "next-monolith",
    livekit: {
      connected: livekitConnected,
      active_rooms: rooms,
      total_participants: participants,
    },
    database: {
      connected: dbConnected,
      active_connections: null,
    },
    requests: {
      total_requests: 0,
      requests_per_second: 0,
      average_latency_ms: 0,
      error_rate: 0,
    },
  });
}

