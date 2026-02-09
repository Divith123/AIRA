const { Room, RoomEvent } = require('@livekit/rtc-engine');

async function main() {
    const roomName = process.env.LIVEKIT_ROOM || 'test-room';
    const agentToken = process.env.LIVEKIT_AGENT_TOKEN;

    if (!agentToken) {
        console.error('LIVEKIT_AGENT_TOKEN not provided');
        process.exit(1);
    }

    console.log(`Starting agent for room: ${roomName}`);

    const room = new Room();

    room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        console.log(`Subscribed to track: ${publication.trackName} from ${participant.identity}`);
    });

    room.on(RoomEvent.ParticipantConnected, (participant) => {
        console.log(`Participant connected: ${participant.identity}`);
    });

    room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        console.log(`Participant disconnected: ${participant.identity}`);
    });

    room.on(RoomEvent.ConnectionStateChanged, (state) => {
        console.log(`Connection state changed: ${state}`);
    });

    try {
        const url = process.env.LIVEKIT_URL || 'ws://localhost:7880';
        console.log(`Connecting to LiveKit at: ${url}`);

        await room.connect(url, agentToken);
        console.log('Successfully connected to LiveKit room');

        // Stay connected
        room.on(RoomEvent.Disconnected, () => {
            console.log('Disconnected from room');
            process.exit(0);
        });

        // Keep the process alive
        setInterval(() => {
            console.log(`Agent heartbeat - connected participants: ${room.participants.size}`);
        }, 30000);

    } catch (error) {
        console.error('Failed to connect to LiveKit:', error);
        process.exit(1);
    }
}

main().catch(console.error);