function required(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function normalizeLiveKitHost(raw: string): string {
  if (raw.startsWith("wss://")) return raw.replace("wss://", "https://");
  if (raw.startsWith("ws://")) return raw.replace("ws://", "http://");
  return raw;
}

export const serverEnv = {
  DATABASE_URL: required("DATABASE_URL"),
  AUTH_SECRET:
    process.env.NEXTAUTH_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    required("JWT_SECRET"),
  JWT_SECRET:
    process.env.JWT_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    required("JWT_SECRET"),
  LIVEKIT_API_KEY: required("LIVEKIT_API_KEY"),
  LIVEKIT_API_SECRET: required("LIVEKIT_API_SECRET"),
  LIVEKIT_HOST: normalizeLiveKitHost(
    process.env.LIVEKIT_API_URL?.trim() ||
      process.env.LIVEKIT_URL?.trim() ||
      required("LIVEKIT_URL"),
  ),
};
