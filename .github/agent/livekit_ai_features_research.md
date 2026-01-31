# LiveKit AI/ML Features: Cloud vs Self-Hosted Comparison

## Executive Summary

LiveKit provides a comprehensive realtime AI agent framework that can be deployed either on **LiveKit Cloud** (managed service) or **self-hosted** infrastructure. While the core framework and most AI/ML features are open-source and self-hostable, some convenience features like **LiveKit Inference** are Cloud-specific.

---

## 1. AI Features Comparison Table

| Feature | LiveKit Cloud | Self-Hosted | Open Source Alternative | Notes |
|---------|--------------|-------------|------------------------|-------|
| **Voice Activity Detection (VAD)** | ✅ Available | ✅ Available | Silero VAD (built-in) | `livekit-plugins-silero` - runs locally on CPU |
| **Turn Detection (Semantic)** | ✅ Available | ✅ Available | LiveKit's open-weight model | `livekit-plugins-turn-detector` - multilingual model, runs on CPU |
| **LiveKit Inference** | ✅ Cloud-native | ❌ Not available | Use provider plugins directly | Unified API for STT/LLM/TTS via Cloud gateway |
| **Agent Builder** | ✅ Cloud-only | ❌ Not available | Build agents in code | Visual no-code builder - cloud feature only |
| **Observability/Tracing** | ✅ Cloud dashboard | ✅ Partial | Custom logging/metrics | Cloud provides transcripts, traces, tags |
| **STT (Speech-to-Text)** | ✅ Via Inference or plugins | ✅ Via plugins | Deepgram, AssemblyAI, Whisper, etc. | Multiple plugin options available |
| **TTS (Text-to-Speech)** | ✅ Via Inference or plugins | ✅ Via plugins | Cartesia, ElevenLabs, etc. | Multiple plugin options available |
| **LLM Integration** | ✅ Via Inference or plugins | ✅ Via plugins | OpenAI, Anthropic, Google, etc. | Direct API integration available |
| **Multi-agent Orchestration** | ✅ Available | ✅ Available | Built-in framework | Open source, works on both |
| **Telephony Integration** | ✅ Available | ✅ Available | LiveKit SIP | Works with both deployment modes |
| **Noise Cancellation** | ✅ Available | ✅ Available | Krisp plugin | `livekit-plugins-noise-cancellation` |
| **Real-time Transcription** | ✅ Available | ✅ Available | Deepgram, AssemblyAI, Whisper | Plugin-based, works on both |
| **Session Tagging** | ✅ Cloud upload | ❌ Local only | Custom implementation | `ctx.tagger` API - cloud sync only |
| **Model Evaluation/Judging** | ✅ Cloud integration | ❌ Local only | Custom eval framework | Built-in test framework works locally |

---

## 2. Detailed Analysis

### 2.1 Voice Activity Detection (VAD) - Self-Hostable ✅

**Status:** Fully self-hostable

LiveKit uses **Silero VAD** which is an open-source voice activity detection model:

```python
from livekit.plugins import silero

# Load and use Silero VAD (runs locally)
vad = silero.VAD.load()

session = AgentSession(
    vad=vad,
    # ... other config
)
```

**Key Facts:**
- ✅ Open source (Silero)
- ✅ Runs entirely on CPU
- ✅ No cloud dependency
- ✅ Model files downloaded locally
- ✅ Works offline after initial download

**Installation:**
```bash
pip install livekit-plugins-silero
python my_agent.py download-files  # Downloads model files
```

---

### 2.2 Agent Builder - Cloud Only ❌

**Status:** Cloud-only feature

LiveKit Agent Builder is a **no-code visual tool** for prototyping and deploying agents directly in the browser. According to the documentation:

> "Use LiveKit Agent Builder to prototype and deploy agents directly in your browser without writing code"

**Key Facts:**
- ❌ Only available in LiveKit Cloud
- ❌ Cannot be self-hosted
- ✅ Alternative: Build agents in Python/Node.js code
- ✅ Full programmatic API available for self-hosted

**Workaround for Self-Hosted:**
Use the code-based approach with `AgentSession` and `AgentServer`:

```python
from livekit.agents import Agent, AgentSession, AgentServer

server = AgentServer()

@server.rtc_session()
async def entrypoint(ctx: JobContext):
    session = AgentSession(
        vad=silero.VAD.load(),
        stt=deepgram.STT(),
        llm=openai.LLM(),
        tts=cartesia.TTS(),
    )
    # ...
```

---

### 2.3 Built-in Inference - Cloud Only ❌

**Status:** Cloud-only feature

LiveKit Inference provides a **unified API** to access different AI models (STT, LLM, TTS) through LiveKit Cloud without managing individual API keys:

```python
from livekit.agents import inference

# Cloud-only: Uses LiveKit Inference gateway
session = AgentSession(
    stt=inference.STT("deepgram/nova-3"),
    llm=inference.LLM("openai/gpt-4.1-mini"),
    tts=inference.TTS("cartesia/sonic-3", voice="..."),
)
```

**Gateway URL:** `https://agent-gateway.livekit.cloud/v1`

**Key Facts:**
- ❌ Only works with LiveKit Cloud
- ❌ Requires Cloud API credentials
- ✅ Unified interface for multiple providers
- ✅ No individual API keys needed

**Workaround for Self-Hosted - Use Provider Plugins:**

```python
from livekit.plugins import openai, deepgram, cartesia

# Self-hosted: Use plugins directly with your own API keys
session = AgentSession(
    stt=deepgram.STT(model="nova-3"),
    llm=openai.LLM(model="gpt-4.1-mini"),
    tts=cartesia.TTS(model="sonic-3", voice="..."),
)
```

**Available Provider Plugins (all self-hostable):**

| Category | Plugins |
|----------|---------|
| **STT** | Deepgram, AssemblyAI, Cartesia, ElevenLabs, Gladia, Google, AWS, Azure |
| **LLM** | OpenAI, Anthropic, Google, Mistral, Groq, Fireworks, Ollama |
| **TTS** | Cartesia, ElevenLabs, Deepgram, Rime, Azure, Google, LMNT |

---

### 2.4 Turn Detection (Semantic) - Self-Hostable ✅

**Status:** Fully self-hostable

LiveKit's custom **end-of-turn detection model** is open-weight and can run locally:

```python
from livekit.plugins.turn_detector.multilingual import MultilingualModel

session = AgentSession(
    turn_detection=MultilingualModel(),
    # ...
)
```

**Key Facts:**
- ✅ Open-weight model
- ✅ Runs locally on CPU
- ✅ ~400MB RAM required
- ✅ ~25ms inference time
- ✅ Supports 13 languages
- ✅ Licensed under LiveKit Model License

**Model Details:**
- Uses transformer architecture
- Trained specifically for end-of-turn detection
- More accurate than VAD alone (understands language context)
- Works with Realtime APIs (OpenAI Realtime, etc.)

**Installation:**
```bash
pip install livekit-plugins-turn-detector
python my_agent.py download-files  # Downloads model files
```

---

### 2.5 Real-Time Transcription - Self-Hostable ✅

**Status:** Fully self-hostable via plugins

Multiple options for real-time transcription in self-hosted deployments:

```python
# Option 1: Deepgram (recommended)
from livekit.plugins import deepgram
stt = deepgram.STT(model="nova-3", language="multi")

# Option 2: AssemblyAI
from livekit.plugins import assemblyai
stt = assemblyai.STT()

# Option 3: Self-hosted Whisper (via faster-whisper)
# Use livekit-plugins-openai with local Whisper endpoint
```

**Self-Hosted Whisper Workaround:**
For fully offline transcription, run Whisper locally:

```python
from livekit.plugins import openai

# Point to local Whisper server
stt = openai.STT(
    model="whisper-1",  # or your local model name
    base_url="http://localhost:8000/v1",  # Local Whisper endpoint
    api_key="not-needed"
)
```

**Open Source Whisper Servers:**
- [faster-whisper-server](https://github.com/fedirz/faster-whisper-server)
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp) with HTTP server
- [whisper-asr-webservice](https://github.com/ahmetoner/whisper-asr-webservice)

---

## 3. Complete Feature Matrix

### Core Framework (Always Available)

| Component | Self-Hosted | Cloud | Notes |
|-----------|-------------|-------|-------|
| WebRTC Media Transport | ✅ | ✅ | Core server component |
| Agent Framework (Python/Node) | ✅ | ✅ | Open source |
| Job Scheduling/Dispatch | ✅ | ✅ | Built into server |
| Multi-agent Handoff | ✅ | ✅ | Framework feature |
| Tool Use (Function Calling) | ✅ | ✅ | LLM integration |
| Telephony (SIP) | ✅ | ✅ | LiveKit SIP component |
| Data Channels/RPC | ✅ | ✅ | Core feature |

### AI/ML Features

| Component | Self-Hosted | Cloud | Open Alternative |
|-----------|-------------|-------|------------------|
| Silero VAD | ✅ | ✅ | Built-in |
| Turn Detector Model | ✅ | ✅ | Open-weight |
| Noise Cancellation | ✅ | ✅ | Krisp plugin |
| LiveKit Inference API | ❌ | ✅ | Use provider plugins |
| Managed Model Gateway | ❌ | ✅ | Self-manage APIs |
| Built-in Observability | Partial | ✅ | Custom logging |

---

## 4. Self-Hosting Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Self-Hosted Stack                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐     ┌──────────────────────┐          │
│  │  LiveKit Server │◄────┤   LiveKit Agents     │          │
│  │  (WebRTC/SFU)   │     │   (Your Code)        │          │
│  └─────────────────┘     └──────────┬───────────┘          │
│                                     │                       │
│         ┌───────────────────────────┼───────────┐          │
│         │                           │           │          │
│         ▼                           ▼           ▼          │
│  ┌──────────────┐        ┌─────────────┐  ┌──────────┐    │
│  │  Silero VAD  │        │ Turn Det.   │  │  STT     │    │
│  │  (Local CPU) │        │ (Local CPU) │  │  Plugin  │    │
│  └──────────────┘        └─────────────┘  └────┬─────┘    │
│                                                 │          │
│  ┌──────────────┐        ┌─────────────┐       │          │
│  │  LLM Plugin  │◄───────┤  TTS Plugin │◄──────┘          │
│  │ (OpenAI/etc) │        │(Cartesia/  │                   │
│  │  Direct API  │        │ElevenLabs) │                   │
│  └──────────────┘        └─────────────┘                   │
│                                                             │
│  Note: Each plugin uses your own API keys for providers    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Workarounds for Cloud-Only Features

### 5.1 Replacing LiveKit Inference

| Cloud Feature | Self-Hosted Alternative | Implementation |
|---------------|------------------------|----------------|
| `inference.STT()` | Provider plugins | `deepgram.STT()`, `assemblyai.STT()` |
| `inference.LLM()` | Provider plugins | `openai.LLM()`, `anthropic.LLM()` |
| `inference.TTS()` | Provider plugins | `cartesia.TTS()`, `elevenlabs.TTS()` |

**Example Migration:**

```python
# Cloud version
from livekit.agents import inference
session = AgentSession(
    stt=inference.STT("deepgram/nova-3"),
    llm=inference.LLM("openai/gpt-4.1-mini"),
    tts=inference.TTS("cartesia/sonic-3"),
)

# Self-hosted version
from livekit.plugins import deepgram, openai, cartesia
session = AgentSession(
    stt=deepgram.STT(model="nova-3"),
    llm=openai.LLM(model="gpt-4.1-mini"),
    tts=cartesia.TTS(model="sonic-3", voice="..."),
)
```

### 5.2 Replacing Agent Builder

| Cloud Feature | Self-Hosted Alternative | Implementation |
|---------------|------------------------|----------------|
| Visual Builder | Code-based agents | Python/Node.js code |
| No-code deployment | Docker deployment | Self-managed containers |
| Browser-based config | Configuration files | YAML/JSON configs |

### 5.3 Replacing Cloud Observability

| Cloud Feature | Self-Hosted Alternative | Implementation |
|---------------|------------------------|----------------|
| Transcript storage | Local logging | Custom transcript handler |
| Session traces | OpenTelemetry | OTel instrumentation |
| Session tags | Custom metadata | Database storage |
| Metrics dashboard | Prometheus/Grafana | Custom metrics export |

---

## 6. System Requirements for Self-Hosting

### Minimum Requirements (per agent server)

| Component | Requirement |
|-----------|-------------|
| CPU | 4 cores |
| RAM | 8 GB |
| Storage | 10 GB ephemeral |
| Network | WebSocket outbound (no inbound ports needed) |

### Model Resource Usage

| Model | RAM | CPU | GPU | Notes |
|-------|-----|-----|-----|-------|
| Silero VAD | ~50MB | Low | Not required | Runs on CPU |
| Turn Detector | ~400MB | Low | Not required | Runs on CPU |
| Whisper (local) | ~1-2GB | Medium | Optional | Varies by model size |

### Concurrent Agents

A 4-core/8GB machine can handle:
- 10-25 concurrent voice AI jobs (depending on components)
- Load balancing built into LiveKit server
- Auto-scaling support via Kubernetes HPA

---

## 7. Cost Comparison

| Cost Factor | LiveKit Cloud | Self-Hosted |
|-------------|---------------|-------------|
| Infrastructure | Pay-per-use (minutes) | Server costs (fixed/variable) |
| AI Provider APIs | Via LiveKit (no API keys) | Direct billing (need API keys) |
| Bandwidth | Included | Your cost |
| Compute Scaling | Automatic | Self-managed |
| DevOps | Minimal | Required |

---

## 8. Summary Recommendations

### Use LiveKit Cloud If:
- You want minimal infrastructure management
- You need the unified Inference API
- You want visual Agent Builder
- You prefer managed observability
- You want automatic scaling

### Use Self-Hosted If:
- You need data sovereignty/privacy
- You want to minimize platform costs at scale
- You have existing AI provider relationships
- You need offline/air-gapped deployment
- You want full control over the stack

### Hybrid Approach:
- Use LiveKit Cloud for media transport and observability
- Deploy agents to your own infrastructure
- Use provider plugins directly
- This is supported and documented by LiveKit

---

## References

1. [LiveKit Agents Documentation](https://docs.livekit.io/agents/)
2. [LiveKit Agents GitHub](https://github.com/livekit/agents)
3. [Self-Hosted Deployment Guide](https://docs.livekit.io/deploy/custom/deployments/)
4. [Turn Detector Plugin](https://github.com/livekit/agents/tree/main/livekit-plugins/livekit-plugins-turn-detector)
5. [Silero VAD Plugin](https://github.com/livekit/agents/tree/main/livekit-plugins/livekit-plugins-silero)
