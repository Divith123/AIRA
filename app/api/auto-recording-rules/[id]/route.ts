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

export async function DELETE(request: NextRequest, context: RouteContext) {
  const claims = requireAuth(request);
  if (claims instanceof NextResponse) return claims;
  const { id } = await resolveParams(context.params);

  await query("DELETE FROM auto_recording_rules WHERE id = $1", [id]);
  return new NextResponse(null, { status: 204 });
}

