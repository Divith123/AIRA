import { NextResponse } from "next/server";

export function jsonError(
  status: number,
  message: string,
  details?: unknown,
) {
  return NextResponse.json(
    {
      error: message,
      details,
    },
    { status },
  );
}

export async function readJson<T>(
  request: Request,
): Promise<T> {
  return (await request.json()) as T;
}

export function okJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}
