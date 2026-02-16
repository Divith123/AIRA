import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";
import { WebhookReceiver } from "livekit-server-sdk";
import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/server/db";
import { serverEnv } from "@/lib/server/env";

function projectIdFromRoom(roomName: string) {
  if (!roomName.startsWith("prj-")) return null;
  const rest = roomName.slice(4);
  const dash = rest.indexOf("-");
  if (dash <= 0) return null;
  return rest.slice(0, dash);
}

function verifyHmacSignature(signature: string, body: string) {
  const hmac = createHmac("sha256", serverEnv.LIVEKIT_API_SECRET);
  hmac.update(body);
  const expected = `sha256=${hmac.digest("base64")}`;

  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const authHeader = request.headers.get("authorization") || undefined;
  const signature = request.headers.get("x-livekit-signature");

  try {
    if (authHeader) {
      const receiver = new WebhookReceiver(
        serverEnv.LIVEKIT_API_KEY,
        serverEnv.LIVEKIT_API_SECRET,
      );
      await receiver.receive(body, authHeader);
    } else if (signature) {
      const ok = verifyHmacSignature(signature, body);
      if (!ok) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(body) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const eventType = String(payload.event || "unknown");
  const eventId = randomUUID();
  await query(
    `
      INSERT INTO webhook_events (
        id, event_type, payload, processed, delivery_attempts, created_at
      )
      VALUES ($1, $2, $3, false, 0, NOW())
    `,
    [eventId, eventType, body],
  );

  try {
    if (eventType === "room_started") {
      const room = (payload.room || {}) as Record<string, unknown>;
      const roomName = String(room.name || "");
      const sid = String(room.sid || "");
      if (roomName && sid) {
        const projectId = projectIdFromRoom(roomName);
        await query(
          `
            INSERT INTO sessions (
              sid, room_name, status, start_time, project_id, created_at
            )
            VALUES ($1, $2, 'active', NOW(), $3, NOW())
            ON CONFLICT (sid) DO UPDATE
            SET status = 'active', start_time = NOW()
          `,
          [sid, roomName, projectId],
        );
      }
    } else if (eventType === "room_finished") {
      const room = (payload.room || {}) as Record<string, unknown>;
      const roomName = String(room.name || "");
      if (roomName) {
        await query(
          `
            UPDATE sessions
            SET status = 'finished', end_time = NOW()
            WHERE room_name = $1
          `,
          [roomName],
        );
      }
    } else if (eventType === "participant_joined" || eventType === "participant_left") {
      const delta = eventType === "participant_joined" ? 1 : -1;
      const latest = await query<{ total_participants: number | null }>(
        `
          SELECT total_participants
          FROM analytics_snapshots
          ORDER BY timestamp DESC
          LIMIT 1
        `,
      );
      const current = latest.rows[0]?.total_participants || 0;
      const totalParticipants = Math.max(0, current + delta);
      const activeRooms = await query<{ count: string }>(
        "SELECT COUNT(DISTINCT room_name)::text AS count FROM sessions WHERE status = 'active'",
      );

      await query(
        `
          INSERT INTO analytics_snapshots (
            id, timestamp, active_rooms, total_participants
          )
          VALUES ($1, NOW(), $2, $3)
        `,
        [randomUUID(), Number(activeRooms.rows[0]?.count || 0), totalParticipants],
      );
    }

    await query(
      `
        UPDATE webhook_events
        SET processed = true, delivery_attempts = 1
        WHERE id = $1
      `,
      [eventId],
    );
  } catch (error) {
    await query(
      `
        UPDATE webhook_events
        SET
          processed = false,
          delivery_attempts = delivery_attempts + 1,
          last_error = $2
        WHERE id = $1
      `,
      [eventId, error instanceof Error ? error.message : "processing_error"],
    );
  }

  return new NextResponse(null, { status: 200 });
}

