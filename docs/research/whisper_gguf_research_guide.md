# Whisper GGUF Models for Self-Hosted Speech Recognition

## Executive Summary

This guide provides comprehensive research on using Whisper GGUF models for self-hosted speech recognition, with focus on lightweight deployment, CPU efficiency, and LiveKit Agents integration.

---

## 1. What are Whisper GGUF Models?

### Understanding the Format

**GGUF (GGML Universal Format)** is a binary format developed by Georgi Gerganov (creator of llama.cpp) for storing machine learning models. It replaces the older GGML format and provides:

- **Single-file packaging**: Model parameters, mel filters, vocabulary, and weights in one file
- **Quantization support**: Multiple precision levels (Q4_0, Q5_0, Q8_0, F16, F32)
- **Cross-platform compatibility**: Works on CPU, GPU, mobile, and edge devices
- **Zero runtime allocations**: Efficient memory management

### Why Use GGUF Models?

| Advantage | Benefit |
|-----------|---------|
| **Lighter** | Quantized models use 25-75% less disk space and RAM |
| **Faster** | Optimized inference engines (CTranslate2, whisper.cpp) |
| **CPU-friendly** | Runs efficiently without GPU acceleration |
| **Privacy** | 100% local processing, no data leaves your server |
| **Cost-effective** | No API fees, works on commodity hardware |

### Model Size Comparison

| Model | Original Size | GGUF Q8_0 | GGUF Q5_0 | Parameters |
|-------|--------------|-----------|-----------|------------|
| tiny | 75 MB | ~39 MB | ~25 MB | 39M |
| base | 142 MB | ~74 MB | ~47 MB | 74M |
| small | 466 MB | ~242 MB | ~155 MB | 244M |
| medium | 1.5 GB | ~779 MB | ~498 MB | 769M |
| large-v3 | 2.9 GB | ~1.5 GB | ~1.0 GB | 1550M |
| large-v3-turbo | 1.6 GB | ~809 MB | ~517 MB | 809M |

---

## 2. Tools Supporting Whisper GGUF

### 2.1 whisper.cpp (Recommended for CPU)

**Repository**: https://github.com/ggml-org/whisper.cpp

**Key Features**:
- Plain C/C++ implementation, no dependencies
- Optimized for Apple Silicon (ARM NEON, Metal, Core ML)
- AVX intrinsics for x86 architectures
- Integer quantization support (Q4_0, Q5_0, Q8_0)
- Voice Activity Detection (VAD) support
- HTTP server mode with OpenAI-compatible API
- Real-time streaming support

**Installation**:
```bash
git clone https://github.com/ggml-org/whisper.cpp.git
cd whisper.cpp

# Download a model
sh ./models/download-ggml-model.sh base.en

# Build
cmake -B build
cmake --build build -j --config Release

# Transcribe
./build/bin/whisper-cli -f samples/jfk.wav -m models/ggml-base.en.bin
```

**Build Options**:
```bash
# CPU with OpenBLAS acceleration
cmake -B build -DGGML_BLAS=1

# NVIDIA GPU support
cmake -B build -DGGML_CUDA=1

# Apple Silicon (Metal)
cmake -B build -DWHISPER_COREML=1

# Vulkan GPU support
cmake -B build -DGGML_VULKAN=1

# OpenVINO (Intel GPU/CPU)
cmake -B build -DWHISPER_OPENVINO=1
```

### 2.2 faster-whisper (CTranslate2)

**Repository**: https://github.com/SYSTRAN/faster-whisper

**Key Features**:
- Up to 4x faster than original Whisper
- CTranslate2 inference engine
- Quantization support (int8, float16)
- Batched transcription
- VAD integration (Silero)
- Word-level timestamps

**Installation**:
```bash
pip install faster-whisper
```

**Usage**:
```python
from faster_whisper import WhisperModel

# CPU with int8 quantization
model = WhisperModel("small", device="cpu", compute_type="int8")

# GPU with float16
model = WhisperModel("large-v3", device="cuda", compute_type="float16")

segments, info = model.transcribe("audio.mp3", beam_size=5)
for segment in segments:
    print(f"[{segment.start:.2f}s -> {segment.end:.2f}s] {segment.text}")
```

### 2.3 llama.cpp with Whisper Support

llama.cpp primarily focuses on LLMs but shares the same GGML/GGUF ecosystem with whisper.cpp.

---

## 3. Performance Benchmarks

### 3.1 CPU Performance Comparison

Test conditions: ~2 minute audio file, various CPU configurations

| Tool | Model | CPU Time | Notes |
|------|-------|----------|-------|
| whisper.cpp | tiny | ~10s | Fastest, lowest accuracy |
| whisper.cpp | base | ~20s | Good for real-time |
| whisper.cpp | small | ~46s | Balanced speed/accuracy |
| whisper.cpp | medium | ~2m | Better accuracy |
| whisper.cpp | large | ~4m | Best accuracy, slower |
| faster-whisper | small (int8) | ~14s | Faster than whisper.cpp |
| faster-whisper | medium (int8) | ~43s | Recommended for CPU |
| faster-whisper | large-v2 (int8) | ~75s | Good accuracy tradeoff |

### 3.2 GPU Performance (for reference)

| Tool | Model | GPU Time | VRAM |
|------|-------|----------|------|
| whisper.cpp | small | ~30s | ~852 MB |
| whisper.cpp | medium | ~74s | ~2.1 GB |
| whisper.cpp | large | ~124s | ~3.9 GB |
| faster-whisper | small (fp16) | ~2.5s | ~1 GB |
| faster-whisper | medium (fp16) | ~6s | ~2.5 GB |
| faster-whisper | large-v2 (fp16) | ~9s | ~4.8 GB |

### 3.3 Memory Usage

| Model | Disk | RAM (loaded) |
|-------|------|--------------|
| tiny | 75 MB | ~273 MB |
| base | 142 MB | ~388 MB |
| small | 466 MB | ~852 MB |
| medium | 1.5 GB | ~2.1 GB |
| large | 2.9 GB | ~3.9 GB |
| large-v3-turbo | 1.6 GB | ~2.1 GB |

### 3.4 Quantization Impact

| Quantization | Size Reduction | Speed Improvement | Accuracy Impact |
|--------------|----------------|-------------------|-----------------|
| F32 (full) | 100% | Baseline | Best |
| F16 | 50% | 1.5-2x | Minimal |
| Q8_0 | 25% | 2-3x | Very slight |
| Q5_0 | 16% | 3-4x | Minor |
| Q4_0 | 12.5% | 4-5x | Moderate |

---

## 4. Can It Run on CPU Efficiently?

### Answer: YES, with the right configuration

**For Real-time Applications**:
- Use **tiny** or **base** models
- Achieve <1s latency on modern CPUs
- Suitable for voice commands, short utterances

**For Batch Transcription**:
- Use **small** or **medium** models with int8 quantization
- 2-4x faster than real-time on 4+ core CPUs
- Good for podcast transcription, meeting notes

**CPU Optimization Tips**:

1. **Use quantization**: int8 (Q8_0) reduces memory and speeds up inference
2. **Enable BLAS**: Link against OpenBLAS or MKL for matrix operations
3. **Thread tuning**: Use `-t` flag to set optimal thread count (usually = physical cores)
4. **VAD filtering**: Pre-filter silence to reduce processing time
5. **Batch processing**: Process multiple files simultaneously

**Recommended CPU Specs**:

| Use Case | Min CPU | Recommended | Model |
|----------|---------|-------------|-------|
| Real-time | 2 cores | 4 cores | tiny/base |
| Batch | 4 cores | 8+ cores | small/medium |
| High accuracy | 8 cores | 16+ cores | medium/large |

---

## 5. LiveKit Agents Integration

### 5.1 Understanding LiveKit STT Architecture

LiveKit Agents use a plugin-based architecture for STT:
- Plugins implement the `STT` interface
- Can use streaming or non-streaming models
- VAD (Voice Activity Detection) helps buffer speech segments

### 5.2 Integration Approaches

#### Approach 1: Custom faster-whisper Plugin (Recommended)

Create a custom STT plugin for LiveKit using faster-whisper:

```python
# whisper_stt_plugin.py
import asyncio
import numpy as np
from typing import Optional
from faster_whisper import WhisperModel

from livekit.agents import stt
from livekit.agents.utils import AudioBuffer


class WhisperSTT(stt.STT):
    """LiveKit STT plugin using faster-whisper with local GGUF models"""
    
    def __init__(
        self,
        model_size: str = "small",
        device: str = "cpu",
        compute_type: str = "int8",
        language: Optional[str] = "en",
        beam_size: int = 5,
    ):
        super().__init__(
            capabilities=stt.STTCapabilities(
                streaming=False,
                interim_results=False,
            )
        )
        self._model_size = model_size
        self._device = device
        self._compute_type = compute_type
        self._language = language
        self._beam_size = beam_size
        self._model: Optional[WhisperModel] = None
        
    async def _load_model(self):
        if self._model is None:
            # Load model in executor to avoid blocking
            loop = asyncio.get_event_loop()
            self._model = await loop.run_in_executor(
                None,
                lambda: WhisperModel(
                    self._model_size,
                    device=self._device,
                    compute_type=self._compute_type,
                    cpu_threads=4,
                )
            )
    
    async def recognize(
        self,
        buffer: AudioBuffer,
        *,
        language: Optional[str] = None,
    ) -> stt.SpeechEvent:
        await self._load_model()
        
        # Convert buffer to numpy array
        audio_data = np.frombuffer(buffer.data, dtype=np.int16).astype(np.float32) / 32768.0
        
        # Run inference in executor
        loop = asyncio.get_event_loop()
        segments, info = await loop.run_in_executor(
            None,
            lambda: self._model.transcribe(
                audio_data,
                language=language or self._language,
                beam_size=self._beam_size,
            )
        )
        
        # Collect all text
        text = " ".join([segment.text for segment in segments])
        
        return stt.SpeechEvent(
            type=stt.SpeechEventType.FINAL_TRANSCRIPT,
            alternatives=[
                stt.SpeechAlternative(
                    text=text.strip(),
                    language=info.language,
                )
            ],
        )
```

#### Approach 2: Using whisper.cpp Server Mode

Run whisper.cpp as a standalone server and call it from LiveKit:

```python
# whisper_server_stt.py
import asyncio
import aiohttp
import numpy as np
from typing import Optional

from livekit.agents import stt
from livekit.agents.utils import AudioBuffer


class WhisperServerSTT(stt.STT):
    """LiveKit STT plugin using whisper.cpp HTTP server"""
    
    def __init__(
        self,
        server_url: str = "http://localhost:8080",
        language: Optional[str] = "en",
    ):
        super().__init__(
            capabilities=stt.STTCapabilities(
                streaming=False,
                interim_results=False,
            )
        )
        self._server_url = server_url
        self._language = language
        
    async def recognize(
        self,
        buffer: AudioBuffer,
        *,
        language: Optional[str] = None,
    ) -> stt.SpeechEvent:
        # Convert to wav format
        import wave
        import io
        
        wav_buffer = io.BytesIO()
        with wave.open(wav_buffer, 'wb') as wav_file:
            wav_file.setnchannels(buffer.num_channels)
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(buffer.sample_rate)
            wav_file.writeframes(buffer.data)
        
        wav_data = wav_buffer.getvalue()
        
        # Send to whisper.cpp server
        async with aiohttp.ClientSession() as session:
            data = aiohttp.FormData()
            data.add_field('file', wav_data, filename='audio.wav')
            data.add_field('language', language or self._language or 'en')
            
            async with session.post(
                f"{self._server_url}/inference",
                data=data
            ) as resp:
                result = await resp.json()
                text = result.get('text', '')
                
        return stt.SpeechEvent(
            type=stt.SpeechEventType.FINAL_TRANSCRIPT,
            alternatives=[
                stt.SpeechAlternative(
                    text=text.strip(),
                    language=language or self._language,
                )
            ],
        )
```

#### Approach 3: Using StreamAdapter for Non-Streaming Models

For non-streaming models like Whisper, use LiveKit's `StreamAdapter` with VAD:

```python
# agent_with_whisper.py
from livekit.agents import AgentSession, JobContext, WorkerOptions, cli
from livekit.plugins import silero

from whisper_stt_plugin import WhisperSTT


async def entrypoint(ctx: JobContext):
    await ctx.connect()
    
    # Create custom Whisper STT
    whisper_stt = WhisperSTT(
        model_size="small",  # or "base", "medium"
        device="cpu",
        compute_type="int8",
        language="en",
    )
    
    # Use StreamAdapter with VAD for streaming-like behavior
    from livekit.agents.stt import StreamAdapter
    
    vad = silero.VAD.load()
    streaming_stt = StreamAdapter(
        stt=whisper_stt,
        vad=vad,
    )
    
    session = AgentSession(
        stt=streaming_stt,
        # ... other configuration (LLM, TTS)
    )
    
    await session.start(
        room=ctx.room,
        # ... participant configuration
    )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
```

### 5.3 Complete LiveKit Agent Example

```python
# complete_agent.py
import asyncio
from typing import Optional
import numpy as np
from faster_whisper import WhisperModel

from livekit import agents
from livekit.agents import (
    AgentSession,
    JobContext,
    WorkerOptions,
    cli,
)
from livekit.agents.stt import STT, SpeechEvent, SpeechAlternative, STTCapabilities
from livekit.plugins import silero, openai


class LocalWhisperSTT(STT):
    """
    Production-ready local Whisper STT for LiveKit Agents.
    Uses faster-whisper with GGUF-style quantized models.
    """
    
    SUPPORTED_MODELS = {
        "tiny": "tiny",
        "base": "base",
        "small": "small",
        "medium": "medium",
        "large-v3": "large-v3",
        "large-v3-turbo": "large-v3-turbo",
        # CTranslate2 converted models
        "deepdml/faster-whisper-large-v3-turbo-ct2": "deepdml/faster-whisper-large-v3-turbo-ct2",
    }
    
    def __init__(
        self,
        model: str = "small",
        device: str = "cpu",
        compute_type: str = "int8",
        language: Optional[str] = None,
        beam_size: int = 5,
        vad_filter: bool = True,
        cpu_threads: int = 4,
    ):
        super().__init__(
            capabilities=STTCapabilities(
                streaming=False,
                interim_results=False,
            )
        )
        
        if model not in self.SUPPORTED_MODELS:
            raise ValueError(f"Model {model} not supported. Choose from: {list(self.SUPPORTED_MODELS.keys())}")
        
        self._model_name = self.SUPPORTED_MODELS[model]
        self._device = device
        self._compute_type = compute_type
        self._language = language
        self._beam_size = beam_size
        self._vad_filter = vad_filter
        self._cpu_threads = cpu_threads
        
        self._model: Optional[WhisperModel] = None
        self._lock = asyncio.Lock()
        
    async def _ensure_model_loaded(self):
        """Lazy load the model on first use"""
        if self._model is not None:
            return
            
        async with self._lock:
            if self._model is not None:
                return
                
            agents.utils.log_info(f"Loading Whisper model: {self._model_name}")
            
            loop = asyncio.get_event_loop()
            self._model = await loop.run_in_executor(
                None,
                lambda: WhisperModel(
                    self._model_name,
                    device=self._device,
                    compute_type=self._compute_type,
                    cpu_threads=self._cpu_threads,
                )
            )
            agents.utils.log_info("Whisper model loaded successfully")
    
    async def recognize(
        self,
        buffer: agents.utils.AudioBuffer,
        *,
        language: Optional[str] = None,
    ) -> SpeechEvent:
        """
        Transcribe audio buffer to text.
        """
        await self._ensure_model_loaded()
        
        # Convert int16 audio to float32 [-1, 1]
        audio_data = np.frombuffer(buffer.data, dtype=np.int16).astype(np.float32) / 32768.0
        
        # Ensure mono
        if buffer.num_channels > 1:
            audio_data = audio_data.reshape(-1, buffer.num_channels).mean(axis=1)
        
        # Resample to 16kHz if needed (Whisper expects 16kHz)
        if buffer.sample_rate != 16000:
            import librosa
            loop = asyncio.get_event_loop()
            audio_data = await loop.run_in_executor(
                None,
                lambda: librosa.resample(
                    audio_data,
                    orig_sr=buffer.sample_rate,
                    target_sr=16000
                )
            )
        
        # Run transcription
        loop = asyncio.get_event_loop()
        segments, info = await loop.run_in_executor(
            None,
            lambda: self._model.transcribe(
                audio_data,
                language=language or self._language,
                beam_size=self._beam_size,
                vad_filter=self._vad_filter,
            )
        )
        
        # Collect transcription
        text_parts = []
        for segment in segments:
            text_parts.append(segment.text)
        
        text = " ".join(text_parts).strip()
        
        return SpeechEvent(
            type=agents.stt.SpeechEventType.FINAL_TRANSCRIPT,
            alternatives=[
                SpeechAlternative(
                    text=text,
                    language=info.language if info.language != "nn" else (language or self._language or "en"),
                    confidence=getattr(info, 'confidence', None),
                )
            ],
        )


async def entrypoint(ctx: JobContext):
    """
    LiveKit Agent entrypoint with local Whisper STT.
    """
    await ctx.connect()
    
    # Initialize local Whisper STT with CPU-optimized settings
    local_stt = LocalWhisperSTT(
        model="small",           # Change based on your hardware
        device="cpu",            # Use "cuda" for GPU
        compute_type="int8",     # "int8" for CPU, "float16" for GPU
        language="en",
        beam_size=5,
        vad_filter=True,
        cpu_threads=4,           # Adjust based on your CPU
    )
    
    # Wrap with StreamAdapter for VAD-based streaming behavior
    vad = silero.VAD.load()
    streaming_stt = agents.stt.StreamAdapter(
        stt=local_stt,
        vad=vad,
        min_silence_duration=0.5,
        min_speech_duration=0.2,
    )
    
    # Configure agent session
    session = AgentSession(
        stt=streaming_stt,
        llm=openai.LLM.with_ollama(
            model="llama3.2",
            base_url="http://localhost:11434/v1"
        ),
        tts=silero.TTS.load("en-US-lessac-medium"),
    )
    
    # Start the agent
    await session.start(
        room=ctx.room,
        participant=ctx.participant,
    )
    
    agents.utils.log_info("Agent started with local Whisper STT")


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
```

---

## 6. Model Recommendations

### 6.1 By Use Case

| Use Case | Recommended Model | Tool | Compute Type |
|----------|-------------------|------|--------------|
| **Real-time voice assistant** | large-v3-turbo | faster-whisper | float16 (GPU) / int8 (CPU) |
| **Live transcription** | small | faster-whisper | int8 |
| **Podcast transcription** | medium | faster-whisper | int8 |
| **Meeting notes** | medium/large-v3 | whisper.cpp | Q8_0 |
| **Low-resource device** | base/tiny | whisper.cpp | Q5_0 |
| **Maximum accuracy** | large-v3 | faster-whisper | float16 |

### 6.2 By Hardware

**CPU-only (4 cores, 8GB RAM)**:
```python
# Recommended configuration
WhisperSTT(
    model="small",
    device="cpu",
    compute_type="int8",
    cpu_threads=4,
)
# Expected: 0.5-1x real-time speed
```

**CPU-only (8+ cores, 16GB RAM)**:
```python
# Recommended configuration
WhisperSTT(
    model="medium",
    device="cpu",
    compute_type="int8",
    cpu_threads=8,
)
# Expected: 1-2x real-time speed
```

**With GPU (8GB VRAM)**:
```python
# Recommended configuration
WhisperSTT(
    model="large-v3-turbo",
    device="cuda",
    compute_type="float16",
)
# Expected: 4-8x real-time speed
```

### 6.3 Recommended Models from Hugging Face

| Model | HF Repo | Best For |
|-------|---------|----------|
| large-v3-turbo | `deepdml/faster-whisper-large-v3-turbo-ct2` | Speed + accuracy |
| large-v3 | `Systran/faster-whisper-large-v3` | Maximum accuracy |
| medium | `Systran/faster-whisper-medium` | Balanced CPU |
| small | `Systran/faster-whisper-small` | Fast CPU |
| distilled | `distil-whisper/distil-large-v3` | 2x faster, slight accuracy drop |

---

## 7. Deployment Architecture

### 7.1 Standalone Deployment

```
┌─────────────────────────────────────┐
│         Client Application          │
│    (Web, Mobile, Desktop)           │
└──────────────┬──────────────────────┘
               │ WebRTC / HTTP
               ▼
┌─────────────────────────────────────┐
│       LiveKit Server (SFU)          │
│    (Self-hosted or Cloud)           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│       LiveKit Agent Worker          │
│  ┌─────────────────────────────┐    │
│  │  Custom Whisper STT Plugin  │    │
│  │  - faster-whisper (CTranslate2) │ │
│  │  - Local GGUF models        │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │      LLM (Ollama/etc)       │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │          TTS                │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### 7.2 Docker Deployment

```dockerfile
# Dockerfile.whisper-agent
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir \
    livekit-agents[silero] \
    faster-whisper \
    numpy \
    librosa

# Download Whisper model during build
RUN python -c "from faster_whisper import WhisperModel; WhisperModel('small', device='cpu', compute_type='int8')"

# Copy agent code
COPY . /app
WORKDIR /app

# Run the agent
CMD ["python", "complete_agent.py"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  whisper-agent:
    build:
      context: .
      dockerfile: Dockerfile.whisper-agent
    environment:
      - LIVEKIT_URL=wss://your-livekit-server.com
      - LIVEKIT_API_KEY=${LIVEKIT_API_KEY}
      - LIVEKIT_API_SECRET=${LIVEKIT_API_SECRET}
      - WHISPER_MODEL=small
      - WHISPER_DEVICE=cpu
      - WHISPER_COMPUTE_TYPE=int8
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 4G
    restart: unless-stopped
```

---

## 8. Optimization Checklist

### Pre-deployment
- [ ] Choose appropriate model size for your hardware
- [ ] Test with int8 quantization on CPU
- [ ] Benchmark with your typical audio samples
- [ ] Configure VAD parameters for your use case
- [ ] Set optimal thread count (usually = physical CPU cores)

### Runtime
- [ ] Enable VAD filtering to skip silent segments
- [ ] Use batch processing for multiple files
- [ ] Consider model warmup for consistent latency
- [ ] Monitor memory usage during peak loads

### Production
- [ ] Run multiple agent workers for horizontal scaling
- [ ] Use load balancer for distributing transcription jobs
- [ ] Cache models in memory to avoid reloading
- [ ] Implement health checks and auto-restart

---

## 9. References

- **whisper.cpp**: https://github.com/ggml-org/whisper.cpp
- **faster-whisper**: https://github.com/SYSTRAN/faster-whisper
- **LiveKit Agents**: https://docs.livekit.io/agents/
- **CTranslate2**: https://opennmt.net/CTranslate2/
- **Whisper Models**: https://huggingface.co/Systran
- **Distil-Whisper**: https://github.com/huggingface/distil-whisper

---

## 10. Quick Start Commands

```bash
# 1. Install dependencies
pip install livekit-agents[silero] faster-whisper

# 2. Download a model (automatic on first run)
python -c "from faster_whisper import WhisperModel; WhisperModel('small', device='cpu', compute_type='int8')"

# 3. Set environment variables
export LIVEKIT_URL=wss://your-server.com
export LIVEKIT_API_KEY=your_key
export LIVEKIT_API_SECRET=your_secret

# 4. Run the agent
python complete_agent.py start
```

---

*This guide provides a comprehensive foundation for deploying Whisper GGUF models with LiveKit Agents for self-hosted speech recognition.*
