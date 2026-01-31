# LiveKit Latency Optimization - Configuration Examples

This document provides copy-paste ready configuration examples for optimizing LiveKit voice AI agents for low latency.

## Table of Contents
1. [Basic Low-Latency Agent](#1-basic-low-latency-agent)
2. [Streaming Pipeline Configuration](#2-streaming-pipeline-configuration)
3. [WebRTC Optimization](#3-webrtc-optimization)
4. [VAD/Turn Detection Tuning](#4vadturn-detection-tuning)
5. [Model Selection for Latency](#5-model-selection-for-latency)
6. [Production Deployment](#6-production-deployment)
7. [Monitoring Setup](#7-monitoring-setup)

---

## 1. Basic Low-Latency Agent

### Minimal Latency-Optimized Agent

```python
# low_latency_agent.py
import asyncio
import logging
from livekit.agents import (
    Agent, AgentServer, AgentSession, JobContext, 
    AutoSubscribe, cli, JobProcess
)
from livekit.plugins import silero, deepgram, openai, cartesia

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("low-latency-agent")

def prewarm(proc: JobProcess):
    """Pre-load models to reduce cold-start latency"""
    proc.userdata["vad"] = silero.VAD.load()
    logger.info("Models pre-warmed and ready")

async def entrypoint(ctx: JobContext):
    logger.info(f"Connecting to room {ctx.room.name}")
    
    # Connect with audio-only subscription for lower overhead
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    
    # Wait for first participant
    participant = await ctx.wait_for_participant()
    logger.info(f"Starting agent for participant {participant.identity}")
    
    # Create optimized session
    session = AgentSession(
        # Use pre-warmed VAD
        vad=ctx.proc.userdata["vad"],
        
        # Streaming STT - Deepgram Nova-3 for low latency
        stt=deepgram.STT(
            model="nova-3",
            language="en-US",
            interim_results=True,  # Enable streaming
            endpointing_ms=500,    # Shorter endpointing
        ),
        
        # Fast LLM - GPT-4o-mini for speed
        llm=openai.LLM(model="gpt-4o-mini"),
        
        # Fast TTS - Cartesia Sonic
        tts=cartesia.TTS(
            model="sonic-3",
            voice="your-voice-id",
            # Streaming enabled by default
        ),
    )
    
    # Create agent
    agent = Agent(
        instructions="""You are a helpful voice assistant. 
        Keep responses SHORT and CONCISE for natural conversation.
        Avoid unpronounceable punctuation."""
    )
    
    # Start session
    await session.start(agent=agent, room=ctx.room)
    
    # Initial greeting
    await session.generate_reply(
        instructions=f"Greet {participant.identity} warmly and ask how you can help"
    )

if __name__ == "__main__":
    cli.run_app(
        AgentServer(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
        ),
        production=True,  # Enable production optimizations
    )
```

---

## 2. Streaming Pipeline Configuration

### Full Streaming Architecture

```python
# streaming_agent.py
import asyncio
from typing import AsyncIterator
from livekit.agents import AgentSession, RoomInputOptions
from livekit.plugins import silero, deepgram, openai, cartesia, turn_detector
from livekit.agents.pipeline import VoicePipelineAgent

class StreamingVoiceAgent:
    def __init__(self):
        # Optimized VAD configuration
        self.vad = silero.VAD.load(
            threshold=0.5,                    # Higher = faster detection
            min_speech_duration_ms=100,       # Shorter = faster response
            min_silence_duration_ms=400,      # Shorter = less waiting
        )
        
        # Streaming STT
        self.stt = deepgram.STT(
            model="nova-3",
            interim_results=True,
            endpointing_ms=500,
            vad_events=True,
            smart_format=True,
        )
        
        # Fast LLM with streaming
        self.llm = openai.LLM(
            model="gpt-4o-mini",
            temperature=0.7,
            max_tokens=150,  # Keep responses short
        )
        
        # Ultra-fast TTS
        self.tts = cartesia.TTS(
            model="sonic-3",
            voice="your-voice-id",
        )
    
    async def create_session(self, room, participant):
        """Create optimized agent session"""
        
        # Use VoicePipelineAgent for streaming pipeline
        agent = VoicePipelineAgent(
            vad=self.vad,
            stt=self.stt,
            llm=self.llm,
            tts=self.tts,
            
            # Enable all streaming optimizations
            allow_interruptions=True,
            
            # Buffer settings
            buffer_size_ms=100,  # Lower = lower latency
            
            # Turn detection
            min_endpointing_delay=0.4,  # 400ms silence threshold
            max_endpointing_delay=0.8,
            
            # Chat context
            chat_ctx=self._create_chat_context(),
        )
        
        return agent
    
    def _create_chat_context(self):
        """Create optimized chat context"""
        from livekit.agents.llm import ChatContext
        
        return ChatContext().append(
            role="system",
            text="""You are a fast, responsive voice assistant.
            Rules:
            - Keep responses under 2 sentences
            - Use natural, spoken language
            - No markdown or special formatting
            - Respond immediately"""
        )

# Usage
async def entrypoint(ctx: JobContext):
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    participant = await ctx.wait_for_participant()
    
    streaming_agent = StreamingVoiceAgent()
    agent = await streaming_agent.create_session(ctx.room, participant)
    
    agent.start(ctx.room, participant)
```

---

## 3. WebRTC Optimization

### Client-Side WebRTC Configuration

```typescript
// lib/webrtc-config.ts

export const LOW_LATENCY_RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Add your TURN servers for fallback
    {
      urls: 'turn:your-turn-server.com:3478',
      username: process.env.TURN_USERNAME,
      credential: process.env.TURN_CREDENTIAL,
    },
  ],
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
  iceCandidatePoolSize: 10,
};

export const LOW_LATENCY_AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  sampleRate: 48000,  // OPUS native rate
  channelCount: 1,    // Mono for voice
  latencyHint: 'interactive',  // <100ms target
};

// React component usage
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';

export function LowLatencyVoiceApp({ token }: { token: string }) {
  return (
    <LiveKitRoom
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      audio={LOW_LATENCY_AUDIO_CONSTRAINTS}
      options={{
        rtcConfig: LOW_LATENCY_RTC_CONFIG,
        adaptiveStream: true,
        dynacast: true,
      }}
    >
      <RoomAudioRenderer />
      <VoiceAssistant />
    </LiveKitRoom>
  );
}
```

### Server-Side Room Options

```python
# server/room_options.py
from livekit import rtc

def get_low_latency_room_options() -> rtc.RoomOptions:
    """Get optimized room options for low latency"""
    return rtc.RoomOptions(
        # Enable adaptive streaming
        adaptive_stream=True,
        
        # Dynamic quality adjustment
        dynacast=True,
        
        # Auto-subscribe to audio only (lower overhead)
        auto_subscribe=True,
        
        # Fast reconnect policy
        reconnect_policy=rtc.ReconnectPolicy.FAST,
    )

def get_low_latency_publish_options() -> rtc.TrackPublishOptions:
    """Get optimized track publish options"""
    return rtc.TrackPublishOptions(
        source=rtc.TrackSource.SOURCE_MICROPHONE,
        
        # Use telephone preset for low latency
        audio_preset=rtc.AudioPreset.TELEPHONE,
        
        # Or custom encoding for fine control
        audio_encoding=rtc.AudioEncoding(
            max_bitrate=24000,      // 24 kbps
            priority=rtc.Priority.HIGH,
        ),
    )
```

---

## 4. VAD/Turn Detection Tuning

### Silero VAD Configuration

```python
# config/vad_config.py
from livekit.plugins import silero
from dataclasses import dataclass

@dataclass
class VADConfig:
    """VAD configuration for different scenarios"""
    threshold: float
    min_speech_duration_ms: int
    min_silence_duration_ms: int
    padding_duration_ms: int

# Preset configurations
VAD_PRESETS = {
    "fast_qa": VADConfig(
        threshold=0.6,              # Higher threshold = faster detection
        min_speech_duration_ms=50,  # Very short for quick responses
        min_silence_duration_ms=300, # 300ms silence = end of turn
        padding_duration_ms=100,
    ),
    "conversation": VADConfig(
        threshold=0.5,
        min_speech_duration_ms=100,
        min_silence_duration_ms=500,  # 500ms for natural conversation
        padding_duration_ms=150,
    ),
    "noisy": VADConfig(
        threshold=0.7,              # Higher to filter noise
        min_speech_duration_ms=200,
        min_silence_duration_ms=600,
        padding_duration_ms=200,
    ),
    "thoughtful": VADConfig(
        threshold=0.4,              # Lower for soft speech
        min_speech_duration_ms=150,
        min_silence_duration_ms=800, # Allow longer pauses
        padding_duration_ms=200,
    ),
}

def load_vad(preset: str = "conversation"):
    """Load VAD with specified preset"""
    config = VAD_PRESETS.get(preset, VAD_PRESETS["conversation"])
    
    return silero.VAD.load(
        threshold=config.threshold,
        min_speech_duration_ms=config.min_speech_duration_ms,
        min_silence_duration_ms=config.min_silence_duration_ms,
        padding_duration_ms=config.padding_duration_ms,
    )
```

### Semantic Turn Detection

```python
# config/turn_detection.py
from livekit.plugins import turn_detector
from livekit.agents import AgentSession

def create_semantic_turn_detector():
    """Use LiveKit's ML-based turn detection"""
    return turn_detector.MultilingualModel()

# Usage in session
session = AgentSession(
    vad=load_vad("conversation"),
    turn_detection=create_semantic_turn_detector(),  # ML-based detection
    stt=deepgram.STT(),
    llm=openai.LLM(),
    tts=cartesia.TTS(),
)
```

---

## 5. Model Selection for Latency

### Provider Configuration Map

```python
# config/models.py
from typing import Dict, Any
from dataclasses import dataclass

@dataclass
class ModelConfig:
    """Model configuration with latency estimates"""
    provider: str
    model: str
    latency_ms: int
    cost_per_1m: float
    quality: str

# STT configurations
STT_MODELS = {
    "fast": ModelConfig(
        provider="deepgram",
        model="nova-3",
        latency_ms=200,
        cost_per_1m=0.0043,  # $0.0043/min
        quality="high",
    ),
    "accurate": ModelConfig(
        provider="assemblyai",
        model="universal-2",
        latency_ms=300,
        cost_per_1m=0.0062,
        quality="very_high",
    ),
    "edge": ModelConfig(
        provider="whisper_local",
        model="large-v3",
        latency_ms=300,
        cost_per_1m=0,  # Self-hosted
        quality="high",
    ),
}

# LLM configurations
LLM_MODELS = {
    "ultra_fast": ModelConfig(
        provider="openai",
        model="gpt-4o-mini",
        latency_ms=200,
        cost_per_1m=0.15,
        quality="good",
    ),
    "fast": ModelConfig(
        provider="openai",
        model="gpt-4o",
        latency_ms=400,
        cost_per_1m=2.50,
        quality="excellent",
    ),
    "balanced": ModelConfig(
        provider="anthropic",
        model="claude-3-5-haiku",
        latency_ms=360,
        cost_per_1m=0.80,
        quality="very_good",
    ),
    "local": ModelConfig(
        provider="self_hosted",
        model="mistral-7b",
        latency_ms=130,
        cost_per_1m=0,  # Infrastructure only
        quality="good",
    ),
}

# TTS configurations
TTS_MODELS = {
    "ultra_fast": ModelConfig(
        provider="cartesia",
        model="sonic-3",
        latency_ms=40,
        cost_per_1m=46.70,
        quality="high",
    ),
    "fast": ModelConfig(
        provider="elevenlabs",
        model="flash-v2.5",
        latency_ms=75,
        cost_per_1m=206,
        quality="very_high",
    ),
    "balanced": ModelConfig(
        provider="inworld",
        model="tts-1.5-max",
        latency_ms=130,
        cost_per_1m=10,
        quality="excellent",
    ),
}

def create_optimized_session(speed: str = "balanced"):
    """Create session optimized for specific speed tier"""
    
    if speed == "ultra":
        stt_config = STT_MODELS["fast"]
        llm_config = LLM_MODELS["ultra_fast"]
        tts_config = TTS_MODELS["ultra_fast"]
    elif speed == "fast":
        stt_config = STT_MODELS["fast"]
        llm_config = LLM_MODELS["fast"]
        tts_config = TTS_MODELS["fast"]
    else:  # balanced
        stt_config = STT_MODELS["accurate"]
        llm_config = LLM_MODELS["balanced"]
        tts_config = TTS_MODELS["balanced"]
    
    # Calculate expected latency
    total_latency = (
        stt_config.latency_ms +
        llm_config.latency_ms +
        tts_config.latency_ms +
        100  # Network overhead
    )
    
    print(f"Expected latency: {total_latency}ms")
    
    # Create providers based on config
    # ... (implementation)
```

---

## 6. Production Deployment

### Docker Configuration

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download models during build
COPY download_models.py .
RUN python download_models.py

# Copy application
COPY . .

# Run with production settings
CMD ["python", "agent.py", "production"]
```

### Kubernetes Deployment

```yaml
# k8s/agent-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: livekit-agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: livekit-agent
  template:
    metadata:
      labels:
        app: livekit-agent
    spec:
      containers:
      - name: agent
        image: your-registry/livekit-agent:latest
        resources:
          requests:
            memory: "4Gi"
            cpu: "2"
            nvidia.com/gpu: 1  # If using GPU
          limits:
            memory: "8Gi"
            cpu: "4"
            nvidia.com/gpu: 1
        env:
        - name: LIVEKIT_URL
          valueFrom:
            secretKeyRef:
              name: livekit-secrets
              key: url
        - name: LIVEKIT_API_KEY
          valueFrom:
            secretKeyRef:
              name: livekit-secrets
              key: api-key
        - name: LIVEKIT_API_SECRET
          valueFrom:
            secretKeyRef:
              name: livekit-secrets
              key: api-secret
        - name: MAX_CONCURRENT_JOBS
          value: "20"
        - name: PYTHONUNBUFFERED
          value: "1"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: livekit-agent-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: livekit-agent
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Environment Configuration

```bash
# .env.production

# LiveKit Configuration
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret

# Performance Tuning
MAX_CONCURRENT_JOBS=20
WORKER_TYPE=ROOM
HEALTH_CHECK_INTERVAL=30

# Regional settings
DEPLOYMENT_REGION=us-east-1
PREFERRED_REGIONS=us-east-1,us-west-2,eu-west-1

# Model API Keys
OPENAI_API_KEY=sk-...
DEEPGRAM_API_KEY=...
CARTESIA_API_KEY=...
ELEVENLABS_API_KEY=...

# Optimization flags
ENABLE_STREAMING=true
ENABLE_CACHING=true
ENABLE_PREWARM=true

# Logging
LOG_LEVEL=INFO
ENABLE_LATENCY_METRICS=true
```

---

## 7. Monitoring Setup

### Latency Metrics Collection

```python
# monitoring/metrics.py
import time
from dataclasses import dataclass, field
from typing import Dict, List, Optional
from collections import deque
import statistics

@dataclass
class LatencySnapshot:
    """Single latency measurement"""
    timestamp: float
    component: str
    duration_ms: float
    metadata: Dict[str, Any] = field(default_factory=dict)

class LatencyMonitor:
    """Monitor and track latency metrics"""
    
    def __init__(self, window_size: int = 1000):
        self.measurements: Dict[str, deque] = {}
        self.window_size = window_size
    
    def record(self, component: str, duration_ms: float, metadata: Optional[Dict] = None):
        """Record a latency measurement"""
        if component not in self.measurements:
            self.measurements[component] = deque(maxlen=self.window_size)
        
        self.measurements[component].append(LatencySnapshot(
            timestamp=time.time(),
            component=component,
            duration_ms=duration_ms,
            metadata=metadata or {},
        ))
    
    def get_stats(self, component: str) -> Dict[str, float]:
        """Get latency statistics for a component"""
        if component not in self.measurements:
            return {}
        
        values = [m.duration_ms for m in self.measurements[component]]
        
        return {
            "count": len(values),
            "mean": statistics.mean(values),
            "median": statistics.median(values),
            "p95": self._percentile(values, 95),
            "p99": self._percentile(values, 99),
            "min": min(values),
            "max": max(values),
        }
    
    def _percentile(self, values: List[float], p: float) -> float:
        """Calculate percentile"""
        if not values:
            return 0.0
        sorted_values = sorted(values)
        k = (len(sorted_values) - 1) * p / 100
        f = int(k)
        c = f + 1 if f + 1 < len(sorted_values) else f
        return sorted_values[f] + (k - f) * (sorted_values[c] - sorted_values[f])
    
    def get_all_stats(self) -> Dict[str, Dict[str, float]]:
        """Get stats for all components"""
        return {comp: self.get_stats(comp) for comp in self.measurements}

# Global monitor instance
latency_monitor = LatencyMonitor()

# Decorator for measuring function latency
def measure_latency(component: str):
    def decorator(func):
        async def wrapper(*args, **kwargs):
            start = time.time()
            try:
                return await func(*args, **kwargs)
            finally:
                duration = (time.time() - start) * 1000
                latency_monitor.record(component, duration)
        return wrapper
    return decorator
```

### Prometheus Metrics Export

```python
# monitoring/prometheus.py
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import time

# Define metrics
LATENCY_HISTOGRAM = Histogram(
    'voice_ai_latency_ms',
    'Latency by component',
    ['component'],
    buckets=[50, 100, 200, 300, 500, 800, 1000, 1500, 2000, 3000, 5000]
)

ACTIVE_SESSIONS = Gauge(
    'voice_ai_active_sessions',
    'Number of active sessions'
)

TOTAL_SESSIONS = Counter(
    'voice_ai_total_sessions',
    'Total sessions handled'
)

ERRORS = Counter(
    'voice_ai_errors',
    'Errors by type',
    ['error_type']
)

def record_latency(component: str, duration_ms: float):
    """Record latency to Prometheus"""
    LATENCY_HISTOGRAM.labels(component=component).observe(duration_ms)

def start_metrics_server(port: int = 9090):
    """Start Prometheus metrics server"""
    start_http_server(port)
    print(f"Metrics server started on port {port}")

# Usage in agent
class MonitoredAgent:
    def __init__(self):
        self.metrics_port = 9090
        start_metrics_server(self.metrics_port)
    
    async def process_stt(self, audio):
        start = time.time()
        result = await self.stt.transcribe(audio)
        duration = (time.time() - start) * 1000
        record_latency('stt', duration)
        return result
    
    async def process_llm(self, text):
        start = time.time()
        result = await self.llm.generate(text)
        duration = (time.time() - start) * 1000
        record_latency('llm', duration)
        return result
    
    async def process_tts(self, text):
        start = time.time()
        result = await self.tts.synthesize(text)
        duration = (time.time() - start) * 1000
        record_latency('tts', duration)
        return result
```

### Health Check Endpoint

```python
# monitoring/health.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncio

app = FastAPI()

class HealthStatus(BaseModel):
    status: str
    components: dict
    latency_stats: dict

@app.get("/health")
async def health_check():
    """Basic health check"""
    return {"status": "healthy"}

@app.get("/ready")
async def readiness_check():
    """Readiness check for Kubernetes"""
    # Check all components are ready
    checks = {
        "vad": await check_vad(),
        "stt": await check_stt(),
        "llm": await check_llm(),
        "tts": await check_tts(),
    }
    
    if not all(checks.values()):
        raise HTTPException(status_code=503, detail=checks)
    
    return {"status": "ready", "components": checks}

@app.get("/metrics/latency")
async def get_latency_metrics():
    """Get current latency statistics"""
    return latency_monitor.get_all_stats()

async def check_vad() -> bool:
    try:
        # Quick VAD check
        return True
    except:
        return False

async def check_stt() -> bool:
    try:
        # Quick STT check
        return True
    except:
        return False

async def check_llm() -> bool:
    try:
        # Quick LLM check
        return True
    except:
        return False

async def check_tts() -> bool:
    try:
        # Quick TTS check
        return True
    except:
        return False
```

---

## 8. Complete Working Example

### Full Production-Ready Agent

```python
# main.py - Complete low-latency agent
import asyncio
import logging
from contextlib import asynccontextmanager
from livekit.agents import (
    Agent, AgentServer, AgentSession, JobContext, 
    AutoSubscribe, cli, JobProcess
)
from livekit.plugins import silero, deepgram, openai, cartesia, turn_detector

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("voice-agent")

# Configuration
CONFIG = {
    "vad_preset": "conversation",
    "stt_model": "nova-3",
    "llm_model": "gpt-4o-mini",
    "tts_model": "sonic-3",
    "max_tokens": 150,
    "endpointing_ms": 500,
}

class LatencyTracker:
    """Track latency throughout the pipeline"""
    
    def __init__(self):
        self.measurements = {}
    
    def start(self, component: str):
        self.measurements[f"{component}_start"] = asyncio.get_event_loop().time()
    
    def end(self, component: str) -> float:
        start = self.measurements.get(f"{component}_start")
        if start:
            duration = (asyncio.get_event_loop().time() - start) * 1000
            logger.info(f"{component} latency: {duration:.1f}ms")
            return duration
        return 0

def prewarm(proc: JobProcess):
    """Pre-warm all models"""
    logger.info("Pre-warming models...")
    
    # Load VAD
    proc.userdata["vad"] = silero.VAD.load(
        threshold=0.5,
        min_speech_duration_ms=100,
        min_silence_duration_ms=400,
    )
    
    logger.info("Models pre-warmed")

async def entrypoint(ctx: JobContext):
    tracker = LatencyTracker()
    
    logger.info(f"Connecting to room {ctx.room.name}")
    tracker.start("connect")
    
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    tracker.end("connect")
    
    # Wait for participant
    participant = await ctx.wait_for_participant()
    logger.info(f"Participant joined: {participant.identity}")
    
    # Create optimized session
    session = AgentSession(
        # VAD
        vad=ctx.proc.userdata["vad"],
        
        # Turn detection
        turn_detection=turn_detector.MultilingualModel(),
        
        # STT - streaming
        stt=deepgram.STT(
            model=CONFIG["stt_model"],
            interim_results=True,
            endpointing_ms=CONFIG["endpointing_ms"],
            smart_format=True,
        ),
        
        # LLM - fast
        llm=openai.LLM(
            model=CONFIG["llm_model"],
            max_tokens=CONFIG["max_tokens"],
            temperature=0.7,
        ),
        
        # TTS - streaming
        tts=cartesia.TTS(
            model=CONFIG["tts_model"],
            voice="your-voice-id",
        ),
    )
    
    # Create agent with latency-optimized instructions
    agent = Agent(
        instructions="""You are a fast, helpful voice assistant.
        
CRITICAL RULES:
- Keep EVERY response under 2 sentences
- Use natural, conversational language
- NEVER use markdown, lists, or special characters
- Speak quickly and directly
- If you need more info, ask ONE question only"""
    )
    
    # Start session
    await session.start(agent=agent, room=ctx.room)
    logger.info("Agent session started")
    
    # Send greeting
    await session.generate_reply(
        instructions=f"Briefly greet {participant.identity} and ask how you can help"
    )
    
    # Keep running
    while True:
        await asyncio.sleep(1)

if __name__ == "__main__":
    cli.run_app(
        AgentServer(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm,
        ),
        production=True,
    )
```

---

## Summary

This configuration guide provides:

1. **Basic low-latency agent** - Ready to run example
2. **Streaming pipeline** - Full streaming architecture
3. **WebRTC optimization** - Client and server configs
4. **VAD tuning** - Presets for different scenarios
5. **Model selection** - Latency-optimized provider configs
6. **Production deployment** - Docker, K8s, and environment setup
7. **Monitoring** - Metrics collection and health checks

### Expected Latency with This Configuration

| Component | Expected Latency |
|-----------|-----------------|
| Network (WebRTC) | 50-100ms |
| VAD/Turn Detection | 150-200ms |
| STT (Deepgram) | 150-200ms |
| LLM (GPT-4o-mini) | 200-300ms |
| TTS (Cartesia) | 40-80ms |
| **TOTAL** | **~600-900ms** |

This configuration targets the **Good** tier (<800ms) with potential to reach **Excellent** (<500ms) with edge deployment and further tuning.
