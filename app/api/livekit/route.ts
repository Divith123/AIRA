import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/guards";

export async function GET(request: NextRequest) {
  const auth = requireAuth(request, { admin: true });
  if (auth instanceof NextResponse) return auth;

  return NextResponse.json({
    service: "livekit",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}

