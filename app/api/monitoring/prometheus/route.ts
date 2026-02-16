import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/guards";
import { livekit } from "@/lib/server/livekit";

export async function GET(request: NextRequest) {
  const claims = requireAuth(request);
  if (claims instanceof NextResponse) return claims;

  let livekitConnected = 0;
  let activeRooms = 0;
  let totalParticipants = 0;
  try {
    const rooms = await livekit.room.listRooms();
    livekitConnected = 1;
    activeRooms = rooms.length;
    totalParticipants = rooms.reduce((acc, room) => acc + room.numParticipants, 0);
  } catch {
    livekitConnected = 0;
  }

  let dbConnected = 0;
  try {
    await query("SELECT 1");
    dbConnected = 1;
  } catch {
    dbConnected = 0;
  }

  const lines = [
    "# HELP livekit_connected LiveKit server connection status",
    "# TYPE livekit_connected gauge",
    `livekit_connected ${livekitConnected}`,
    "# HELP livekit_active_rooms Number of active rooms",
    "# TYPE livekit_active_rooms gauge",
    `livekit_active_rooms ${activeRooms}`,
    "# HELP livekit_total_participants Total participants across all rooms",
    "# TYPE livekit_total_participants gauge",
    `livekit_total_participants ${totalParticipants}`,
    "# HELP database_connected Database connection status",
    "# TYPE database_connected gauge",
    `database_connected ${dbConnected}`,
    "# HELP process_uptime_seconds Process uptime in seconds",
    "# TYPE process_uptime_seconds counter",
    "process_uptime_seconds 0",
  ];

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

