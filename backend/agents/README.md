# LiveKit Agents - Hybrid AI Core

This module provides hybrid AI configuration for LiveKit Agents, supporting both paid API providers and open-source self-hosted alternatives with automatic fallback.

## Features

- **Hybrid Mode**: Automatically fallback from API to local models if API fails
- **Per-Project Config**: Override default settings for specific projects
- **Low Latency**: Optimized for <800ms end-to-end voice AI
- **OpenAI-Compatible**: Local services expose OpenAI-compatible APIs

## Quick Start

### 1. Start Local AI Services

```bash
# GPU (recommended)
docker compose -f ../docker/docker-compose.ai.yml --profile gpu up -d

# CPU only
docker compose -f ../docker/docker-compose.ai.yml --profile cpu up -d
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Run Agent

```bash
# Console mode (local testing)
python main.py console

# Development mode (hot reload)
python main.py dev

# Production
python main.py start
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `AGENT_MODE` | `hybrid` | `api`, `local`, or `hybrid` |
| `STT_PROVIDER` | `deepgram` | Primary STT provider |
| `TTS_PROVIDER` | `cartesia` | Primary TTS provider |
| `LLM_PROVIDER` | `openai` | Primary LLM provider |

See `.env.example` for full configuration options.

## Architecture

```
┌──────────────────────────────────────────┐
│         HybridProviderManager            │
├──────────────────────────────────────────┤
│  get_stt() → FallbackAdapter             │
│    ├─ Deepgram API (primary)             │
│    └─ faster-whisper (fallback)          │
│                                          │
│  get_tts() → FallbackAdapter             │
│    ├─ Cartesia API (primary)             │
│    └─ Kokoro local (fallback)            │
│                                          │
│  get_llm() → FallbackAdapter             │
│    ├─ OpenAI API (primary)               │
│    └─ Ollama local (fallback)            │
│                                          │
│  get_vad() → Silero (always local)       │
│  get_turn_detector() → LiveKit model     │
└──────────────────────────────────────────┘
```

## Latency Targets

| Component | API | Local | Target |
|-----------|-----|-------|--------|
| STT | 150ms | 250ms | <200ms |
| TTS | 40ms | 80ms | <100ms |
| LLM | 200ms | 300ms | <300ms |
| VAD | - | 25ms | <50ms |
| **Total** | **~500ms** | **~700ms** | **<800ms** |
