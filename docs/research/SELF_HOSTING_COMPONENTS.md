# LiveKit Self-Hosting Components - Complete Guide

## Verification Status: ✅ VERIFIED AFTER DEEP RESEARCH

This document lists ALL components required to self-host LiveKit based on official documentation at https://docs.livekit.io

---

## 🔴 CORE SERVICES (Required for Complete Self-Hosting)

These are the **backend services** that must run on your infrastructure:

| Component | Repository | Status | Purpose | Language |
|-----------|------------|--------|---------|----------|
| **livekit-server** | `livekit/livekit` | ✅ Cloned | Core WebRTC SFU (Selective Forwarding Unit) | Go |
| **egress** | `livekit/egress` | ✅ Cloned | Recording & live streaming (RTMP/HTTP/HLS) | Go |
| **ingress** | `livekit/ingress` | ✅ Cloned | External media ingestion (RTMP/WHIP) | Go |
| **sip** | `livekit/sip` | ✅ Cloned | Telephony/PSTN bridge for phone calls | Go |

**⚠️ CRITICAL:** All 4 services are required for **complete** self-hosting with full features.

### Architecture Overview
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   LiveKit       │◄───►│     Redis       │◄───►│    Egress       │
│   Server (SFU)  │     │   (Message Bus) │     │  (Recording)    │
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │
         │              ┌─────────────────┐     ┌─────────────────┐
         ├─────────────►│    Ingress      │     │      SIP        │
         │              │ (RTMP/WHIP)     │     │  (Telephony)    │
         │              └─────────────────┘     └─────────────────┘
         │
    ┌────┴────┐
    │ Clients │ (Browser, Mobile, SDKs)
    └─────────┘
```

---

## 🟡 SHARED LIBRARIES (Protocol Definitions)

| Component | Repository | Status | Purpose |
|-----------|------------|--------|---------|
| **protocol** | `livekit/protocol` | ✅ Cloned | Protobuf definitions, shared code |

---

## 🟢 AGENT FRAMEWORKS (For building AI agents - Optional)

| Component | Repository | Status | Purpose | Language |
|-----------|------------|--------|---------|----------|
| **agents** | `livekit/agents` | ✅ Cloned | AI agent framework | Python |
| **agents-js** | `livekit/agents-js` | ✅ Cloned | AI agent framework | Node.js/TypeScript |

---

## 🔵 CLIENT SDKs (For frontend apps - Optional)

| Component | Repository | Status | Purpose |
|-----------|------------|--------|---------|
| **client-sdk-js** | `livekit/client-sdk-js` | ✅ Cloned | Browser/JavaScript SDK |
| **components-js** | `livekit/components-js` | ✅ Cloned | React/Vue UI components |

---

## 🟣 SERVER SDKs & TOOLS (Optional)

| Component | Repository | Status | Purpose | Language |
|-----------|------------|--------|---------|----------|
| **livekit-cli** | `livekit/livekit-cli` | ✅ Cloned | Management CLI | Go |
| **server-sdk-js** | `livekit/server-sdk-js` | ✅ Cloned | Node.js server SDK | TypeScript |

---

## 🟤 DEPLOYMENT (Docker Compose)

| Component | Source | Status | Purpose |
|-----------|--------|--------|---------|
| **docker** | Community (anguzo/livekit-self-hosted) | ✅ Cloned | Docker Compose files for self-hosting |

---

## 📋 Complete Repository List

```
livekit-core/
├── agents/              # AI agents framework (Python)
├── agents-js/           # AI agents framework (Node.js)
├── cli/                 # LiveKit CLI tool
├── client-sdk-js/       # JavaScript client SDK
├── components-js/       # React/Vue components
├── docker/              # Docker Compose for deployment
├── egress/              # Recording & streaming service
├── ingress/             # RTMP/WHIP ingest service
├── protocol/            # Protocol definitions
├── server/              # Core LiveKit SFU server ⭐
├── server-sdk-js/       # Node.js server SDK
└── sip/                 # SIP telephony service ⭐
```

**Total: 12 repositories cloned**

---

## ⚠️ IMPORTANT NOTES

### What was initially MISSING:
1. **SIP service** - Critical for telephony/PSTN integration
   - Found during verification from: https://github.com/livekit/sip
   - Required for phone call integration
   - Communicates via Redis with main server

### Services Architecture:
All services (egress, ingress, sip) communicate with the main LiveKit server via **Redis**:
- Redis acts as message bus and state storage
- Each service needs its own config with Redis connection
- Services can scale independently

### Infrastructure Requirements for Self-Hosting:
1. **Redis** - Required for service coordination
2. **LiveKit Server** - Core SFU (port 7880)
3. **Egress** - For recording (if needed)
4. **Ingress** - For RTMP ingest (if needed)
5. **SIP** - For telephony (if needed)
6. **TURN server** - Included in LiveKit server for NAT traversal
7. **Load balancer** - For SSL termination and distribution

### Comparison with LiveKit Cloud:
| Feature | Self-Hosted | LiveKit Cloud |
|---------|-------------|---------------|
| Realtime media | ✅ | ✅ |
| Egress | ✅ | ✅ |
| Ingress | ✅ | ✅ |
| SIP/Telephony | ✅ | ✅ |
| Agents | ✅ | ✅ |
| Agent Builder | ❌ | ✅ |
| Built-in inference | ❌ | ✅ |
| Global mesh SFU | ❌ | ✅ |
| Managed dashboard | ❌ | ✅ |

---

## ✅ VERIFICATION COMPLETED

After deep research of:
- Official LiveKit documentation (docs.livekit.io)
- GitHub repositories
- Self-hosting guides
- Architecture documentation

**CONFIRMED:** We now have ALL necessary components for complete LiveKit self-hosting.

### References:
1. https://docs.livekit.io/transport/self-hosting/
2. https://github.com/livekit/sip
3. https://github.com/livekit/egress
4. https://github.com/livekit/ingress
5. https://github.com/livekit/livekit

---

*Last verified: 2026-01-31*
