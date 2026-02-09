FROM node:18-alpine

WORKDIR /app

# Install LiveKit SDK
RUN npm install @livekit/rtc-engine

# Copy agent code
COPY test-agent.js /app/agent.js

# Set environment variables
ENV LIVEKIT_URL=ws://host.docker.internal:7880
ENV NODE_ENV=production

CMD ["node", "agent.js"]