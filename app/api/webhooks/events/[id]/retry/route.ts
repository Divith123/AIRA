import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/server/db";
import { requireAuth } from "@/lib/server/guards";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

function resolveParams(params: RouteContext["params"]) {
  if ("then" in params) return params;
  return Promise.resolve(params);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const claims = requireAuth(request);
  if (claims instanceof NextResponse) return claims;
  const { id } = await resolveParams(context.params);

  const eventResult = await query<{
    id: string;
    event_type: string;
    payload: string;
    delivery_attempts: number;
  }>(
    `
      SELECT id, event_type, payload, delivery_attempts
      FROM webhook_events
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );
  const event = eventResult.rows[0];
  if (!event) return NextResponse.json({ error: "Not Found" }, { status: 404 });

  const webhooks = await query<{ config_value: string | null }>(
    `
      SELECT config_value
      FROM configs
      WHERE service_name = 'webhooks'
        AND is_active = true
    `,
  );

  let deliveriesQueued = 0;
  for (const webhookRow of webhooks.rows) {
    if (!webhookRow.config_value) continue;
    let webhook: { id: string; url: string } | null = null;
    try {
      webhook = JSON.parse(webhookRow.config_value) as { id: string; url: string };
    } catch {
      webhook = null;
    }
    if (!webhook?.id || !webhook.url) continue;

    const deliveryId = randomUUID();
    await query(
      `
        INSERT INTO webhook_deliveries (
          id, event_id, webhook_id, url, status_code, response_body, error_message, attempted_at, success
        )
        VALUES ($1, $2, $3, $4, NULL, NULL, NULL, NOW(), false)
      `,
      [deliveryId, id, webhook.id, webhook.url],
    );

    try {
      const payload = (() => {
        try {
          return JSON.parse(event.payload);
        } catch {
          return {};
        }
      })();

      const response = await fetch(webhook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: id,
          event_type: event.event_type,
          payload,
          timestamp: new Date().toISOString(),
        }),
      });
      const body = await response.text();
      const success = response.status >= 200 && response.status < 300;

      await query(
        `
          UPDATE webhook_deliveries
          SET status_code = $2, response_body = $3, success = $4
          WHERE id = $1
        `,
        [deliveryId, response.status, body || null, success],
      );
      if (success) deliveriesQueued += 1;
    } catch (error) {
      await query(
        `
          UPDATE webhook_deliveries
          SET error_message = $2
          WHERE id = $1
        `,
        [deliveryId, error instanceof Error ? error.message : "request_failed"],
      );
    }
  }

  await query(
    `
      UPDATE webhook_events
      SET delivery_attempts = COALESCE(delivery_attempts, 0) + $2
      WHERE id = $1
    `,
    [id, deliveriesQueued],
  );

  return NextResponse.json({
    ok: true,
    deliveries_queued: deliveriesQueued,
  });
}

