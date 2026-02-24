import {
  AccessToken,
  EgressClient,
  IngressClient,
  RoomServiceClient,
  SipClient,
  type VideoGrant,
} from "livekit-server-sdk";
import { serverEnv } from "./env";

const sharedConfig = {
  host: serverEnv.LIVEKIT_HOST,
  apiKey: serverEnv.LIVEKIT_API_KEY,
  apiSecret: serverEnv.LIVEKIT_API_SECRET,
};

const globalForLiveKit = globalThis as typeof globalThis & {
  __airaLiveKitClients?: {
    room: RoomServiceClient;
    ingress: IngressClient;
    egress: EgressClient;
    sip: SipClient;
  };
};

export const livekit =
  globalForLiveKit.__airaLiveKitClients ||
  {
    room: new RoomServiceClient(
      sharedConfig.host,
      sharedConfig.apiKey,
      sharedConfig.apiSecret,
    ),
    ingress: new IngressClient(
      sharedConfig.host,
      sharedConfig.apiKey,
      sharedConfig.apiSecret,
    ),
    egress: new EgressClient(
      sharedConfig.host,
      sharedConfig.apiKey,
      sharedConfig.apiSecret,
    ),
    sip: new SipClient(
      sharedConfig.host,
      sharedConfig.apiKey,
      sharedConfig.apiSecret,
    ),
  };

if (!globalForLiveKit.__airaLiveKitClients) {
  globalForLiveKit.__airaLiveKitClients = livekit;
}

export async function createLiveKitAccessToken(input: {
  identity: string;
  name: string;
  room?: string;
  grants?: VideoGrant;
  metadata?: string;
}) {
  const token = new AccessToken(sharedConfig.apiKey, sharedConfig.apiSecret, {
    identity: input.identity,
    name: input.name,
    ttl: "24h",
    metadata: input.metadata,
  });
  token.addGrant(
    input.grants || {
      roomJoin: true,
      room: input.room,
      canPublish: true,
      canSubscribe: true,
      roomCreate: true,
    },
  );
  return token.toJwt();
}
export async function getLiveKitStats() {
  const rooms = await livekit.room.listRooms();
  const participantsCount = rooms.reduce((acc, room) => acc + room.numParticipants, 0);
  return {
    roomsCount: rooms.length,
    participantsCount,
    rooms,
  };
}
