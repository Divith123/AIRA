# AIRA — LiveKit Management Dashboard

AIRA is a self-hosted management dashboard for [LiveKit](https://livekit.io) infrastructure. It provides a full-featured web interface for managing real-time communication projects, AI agents, telephony, media streaming, and session monitoring — all backed by PostgreSQL and connected to your LiveKit server.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Multi-Project Support](#multi-project-support)
- [Health & Monitoring](#health--monitoring)
- [Webhook Integration](#webhook-integration)
- [Testing](#testing)

---

## Features

### Dashboard
- Real-time metrics: active rooms, connected participants, connection success rate, project count
- Analytics charts: platform distribution, connection types, geographic breakdown, connection trends
- Usage breakdown by WebRTC, Agents, and SIP
- Live tracking monitor with auto-refresh for active rooms
- Historical performance stats (agent peaks, telephony bandwidth, session quality)

### Agent Management
- Create and configure AI agents with custom instructions, voice, and LLM model settings
- Pipeline mode selection (STT → LLM → TTS or Realtime)
- Agent deployment with process, LiveKit CLI, or Python SDK templates
- Action configuration: HTTP tools, client RPC methods, MCP servers
- Environment variable / secrets management per agent
- Agent logs viewer with level filtering, search, and JSON export
- Per-agent metrics: session count, average latency, uptime, success rate

### Session Monitoring
- Paginated session list with search, status filter, and auto-refresh
- Per-room detail view: participant list, audio/video track status, mute/unmute controls
- Actions: remove participant, generate join token, delete room

### Telephony (SIP)
- SIP trunk management (inbound/outbound) with CRUD operations
- Call log viewer with outbound call initiation
- Dispatch rules to route incoming SIP calls to rooms or agents (direct, individual, callee rule types)

### Media Streaming
- **Ingress**: Create RTMP, WHIP, or URL-based ingress endpoints for media input
- **Egress**: Start room composite, web, track, or image snapshot recordings with output configuration

### Settings
- AI configuration: STT / TTS / LLM provider and model selection (Google, AWS, Azure, Deepgram, ElevenLabs, OpenAI, Anthropic, Ollama, etc.)
- Project settings with rename, description, and deletion
- LiveKit API key viewer (URL, API Key, API Secret from server environment)
- Team member management with role-based access (Read / Write / Admin)
- Webhook endpoint configuration for LiveKit events

### Sandbox
- Quickstart templates: Web Voice Agent, Token Server, Video Conference
- Links to sandbox documentation for prototyping

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript 5 |
| Database | PostgreSQL via [Prisma 7](https://www.prisma.io) ORM |
| Auth | Custom JWT (HS256) + [NextAuth 4](https://next-auth.js.org) with Credentials provider |
| Real-time | LiveKit Server SDK, WebSocket events, SSE broadcasting |
| State | [Zustand](https://github.com/pmndrs/zustand) (persisted stores) + [React Query](https://tanstack.com/query) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) + class-variance-authority |
| Charts | [Recharts](https://recharts.org) |
| Validation | [Zod 4](https://zod.dev) |
| Icons | [Lucide React](https://lucide.dev) |
| Font | [Outfit](https://fonts.google.com/specimen/Outfit) (Google Fonts) |
| Testing | [Playwright](https://playwright.dev) (E2E) + endpoint smoke tests |

---

## Prerequisites

- **Node.js** >= 18
- **PostgreSQL** database
- **LiveKit Server** with API key and secret

---

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd AIRA
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory (see [Environment Variables](#environment-variables) below).

4. **Run database migrations**

   ```bash
   npm run migrate
   ```

5. **Seed an admin user** (optional)

   ```bash
   npm run seed:internal
   ```

   Uses `INTERNAL_TEST_EMAIL` and `INTERNAL_TEST_PASSWORD` env vars (defaults are provided in the script).

6. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env.local` file with the following required variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/aira

# Authentication (at least one is required)
JWT_SECRET=your-secret-key
# NEXTAUTH_SECRET=...       (alternative)
# AUTH_SECRET=...            (alternative)

# LiveKit
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
LIVEKIT_URL=wss://your-livekit-server.example.com

# Client-side (optional, defaults to same-origin)
# NEXT_PUBLIC_API_URL=http://localhost:3000
# NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-server.example.com

# Admin seeding (optional)
# INTERNAL_TEST_EMAIL=admin@example.com
# INTERNAL_TEST_PASSWORD=your-password
```

The server normalizes LiveKit URLs automatically (`wss://` → `https://`, `ws://` → `http://`). Multiple env var names are accepted for flexibility (`LIVEKIT_URL` or `LIVEKIT_API_URL`, `JWT_SECRET` or `NEXTAUTH_SECRET` or `AUTH_SECRET`).

---

## Database Setup

AIRA uses Prisma with PostgreSQL. The schema is defined in `prisma/schema.prisma`.

```bash
# Run migrations on a fresh database
npm run migrate

# Create a new migration during development
npm run migrate:dev

# Regenerate the Prisma client
npm run prisma:generate
```

Key database models: `User`, `Project`, `Agent`, `AgentInstance`, `LiveSession`, `ParticipantRecord`, `SipTrunk`, `DispatchRule`, `IngressRecord`, `EgressRecord`, `CallLog`, `Transcript`, `AuditLog`, `WebhookEvent`, `ApiKey`, `RoomTemplate`, `LayoutTemplate`, and more.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client and build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run migrate` | Deploy pending Prisma migrations |
| `npm run migrate:dev` | Create and apply migrations in development |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run seed:internal` | Seed an admin user and Administrator role |
| `npm run test:endpoints` | Run API endpoint smoke tests |
| `npm run test:e2e` | Build and run Playwright E2E tests |
| `npm run test:e2e:headed` | Run E2E tests in headed browser mode |

---

## Project Structure

```
app/
├── layout.tsx                 # Root layout (Outfit font, ThemeProvider, Providers)
├── page.tsx                   # Root redirect (→ /dashboard or /login)
├── (pages)/                   # Main application pages
│   ├── dashboard/             # Analytics dashboard
│   ├── agents/                # Agent management (overview, instructions, models, deploy, logs, actions)
│   ├── sessions/              # Session list + room detail view
│   ├── telephony/             # SIP trunks, calls, dispatch rules
│   ├── ingresses/             # Media ingress management
│   ├── egresses/              # Media egress/recording management
│   ├── sandbox/               # Quickstart templates
│   ├── settings/              # AI config, project, API keys, members, webhooks
│   ├── login/                 # Authentication page
│   └── welcome/               # Onboarding
├── [projectId]/               # Multi-project routing (mirrors pages structure)
├── api/                       # API route handlers
│   ├── agents/                # Agent CRUD + deploy + logs + metrics
│   ├── sessions/              # Session listing + stats
│   ├── livekit/               # Room management, token generation, ingress/egress
│   ├── telephony/             # SIP trunks, dispatch rules, call logs
│   ├── analytics/             # Dashboard, summary, timeseries data
│   ├── auth/                  # Register, login, refresh, me
│   ├── projects/              # Project CRUD + AI config
│   ├── settings/              # Roles, storage, auto-recording
│   ├── webhooks/              # Webhook endpoint config + event history
│   ├── monitoring/            # System monitoring
│   └── ...                    # Audit logs, transcripts, metrics, etc.
├── health/                    # GET /health — database + LiveKit connectivity
├── metrics/                   # GET /metrics — Prometheus-format metrics
├── webhook/                   # POST /webhook — LiveKit webhook receiver
└── components/                # App-level components (Header, Sidebar)

components/                    # Shared UI components
├── ui/                        # Button, Card, Input, Select, Modal, Loader, Skeleton
├── layouts/                   # DashboardLayout, AuthLayout
├── modals/                    # CreateAgentModal, DeployAgentModal, CreateDispatchRuleModal
├── agent/                     # AgentLayout, AgentPreview
└── *.tsx                      # Charts, StatsCard, AnalyticsCard, ErrorBoundary, ThemeProvider

contexts/                      # React contexts (AuthContext, RealtimeContext)
hooks/                         # Custom hooks (useClickOutside, useLiveRooms, useWebSocket, useQualityScore)
lib/
├── api.ts                     # Client-side API layer (fetch wrapper, token management)
├── store.ts                   # Zustand stores (auth, settings, realtime)
├── schemas.ts                 # Zod validation schemas
├── providers.tsx              # QueryClient + AuthProvider wrapper
├── utils.ts                   # Utility functions
└── server/                    # Server-only modules
    ├── auth.ts                # JWT token generation/verification, password hashing
    ├── auth-options.ts        # NextAuth configuration
    ├── livekit.ts             # LiveKit SDK clients (Room, Ingress, Egress, SIP)
    ├── prisma.ts              # Prisma client singleton
    ├── env.ts                 # Environment variable validation
    └── ...                    # Guards, HTTP helpers, project utils, session sync

prisma/
├── schema.prisma              # Database schema (30+ models)
└── migrations/                # Migration history

scripts/
├── seed-internal-user.mjs     # Admin user seeder
└── endpoint-smoke.mjs         # API smoke test suite (all endpoints)

tests/e2e/                     # Playwright E2E test specs
```

---

## Authentication

AIRA uses a dual authentication system:

- **Custom JWT**: HS256 tokens with 24-hour access tokens and 30-day refresh tokens. Passwords are hashed with bcryptjs (12 rounds). Tokens are extracted from the `Authorization: Bearer` header, `token` cookie, or query parameter.
- **NextAuth**: Credentials provider with Prisma adapter and JWT session strategy. Role-based admin detection.

Protected routes automatically redirect unauthenticated users to `/login`.

---

## Multi-Project Support

AIRA supports multiple projects under a single deployment:

- Each project has its own agents, sessions, ingresses, egresses, telephony config, webhooks, and team members
- Active project is resolved from: URL path (`/[projectId]/...`) → `localStorage` → first available project
- Room names are scoped with `prj-{projectId}-` prefixes
- Project switching is available from the sidebar

---

## Health & Monitoring

### Health Check

```
GET /health
```

Returns `healthy` or `degraded` status with per-service breakdown (database connectivity via `SELECT 1`, LiveKit connectivity via `listRooms`).

### Prometheus Metrics

```
GET /metrics
```

Exposes Prometheus-format metrics:
- `livekit_connected` — LiveKit server reachability
- `livekit_active_rooms` — Current active room count
- `livekit_total_participants` — Current total participants
- `database_connected` — Database reachability
- `process_uptime_seconds` — Process uptime

---

## Webhook Integration

AIRA receives LiveKit server webhooks at `POST /webhook`. Events are authenticated using JWT (`WebhookReceiver`) or HMAC-SHA256 signatures.

Processed event types:
- **Room**: `room_started`, `room_finished` — creates/closes session records
- **Participant**: `participant_joined`, `participant_left` — tracks participants with platform, browser, and country detection
- **Egress**: tracks file, stream, segment, and image results
- **Ingress**: tracks state changes

All events are stored in the database and broadcast via SSE for real-time UI updates.

Configure your LiveKit server to send webhooks to `https://your-aira-domain.com/webhook`.

---

## Testing

### E2E Tests (Playwright)

```bash
# Run headless
npm run test:e2e

# Run with browser visible
npm run test:e2e:headed
```

Tests run against a production build on port 3400 (configurable via `PLAYWRIGHT_PORT`). The web server starts automatically.

### API Smoke Tests

```bash
npm run test:endpoints
```

Registers a test user, logs in, and systematically tests all API endpoints (auth, projects, agents, sessions, analytics, LiveKit, telephony, settings, monitoring, audit logs, transcripts, and more).

---

## License

Private — all rights reserved.
