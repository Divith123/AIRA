# Comprehensive Open-Source TTS Research for LiveKit Agents

**Date:** January 31, 2026  
**Focus:** Self-hostable, low-latency (<200ms) Text-to-Speech options for real-time voice AI applications  
**Target Integration:** LiveKit Agents

---

## Executive Summary

This research evaluates 8 leading open-source TTS systems suitable for integration with LiveKit Agents. The analysis focuses on **low-latency real-time voice AI** applications requiring **<200ms first-chunk latency**.

### Quick Comparison Table

| TTS System | Model Size | VRAM Required | Latency (First Chunk) | RTF | License | Voice Cloning | Best For |
|------------|-----------|---------------|----------------------|-----|---------|---------------|----------|
| **Piper TTS** | 22-75 MB | 0 GB (CPU) | 50-150ms | 0.19 | MIT | ❌ | Edge/Embedded |
| **Kokoro-82M** | 82M params | 2-4 GB | 51-84ms | 0.01 | Apache 2.0 | ❌ | Ultra-low latency |
| **MeloTTS** | ~100M | 4-6 GB | 200-230ms | 0.05 | MIT | ❌ | Multilingual |
| **Sherpa-ONNX** | Varies | 0-2 GB | 30-100ms | 0.017 | Apache 2.0 | ⚠️ | CPU inference |
| **XTTS-v2** | 467M (~2GB) | 6-8 GB | 1-3s | 0.3-0.5 | MPL 2.0 | ✅ | Voice cloning |
| **F5-TTS** | ~1B | 6-8 GB | 200-300ms | 0.04 | MIT* | ✅ | High quality |
| **Zonos** | 1.6B | 8-10 GB | 200-300ms | 0.5 | Apache 2.0 | ✅ | Expressive control |
| **StyleTTS 2** | ~200M | 4-6 GB | 100-200ms | 0.01-0.05 | MIT | ✅ | Research |

*F5-TTS models are CC-BY-NC (non-commercial), code is MIT

---

## 1. Piper TTS

### Overview
Piper is a fast, local neural TTS system optimized for low-resource devices like Raspberry Pi. It's based on the VITS (Variational Inference with adversarial learning) architecture.

### Technical Specifications
- **Model Size:** 22 MB (int8 quantized) to 75 MB (float32)
- **VRAM Required:** 0 GB - Runs entirely on CPU
- **Architecture:** VITS with ONNX Runtime
- **Sample Rate:** 22.05 kHz

### Performance Characteristics
- **Real-Time Factor (RTF):** 0.192 (5x faster than real-time on CPU)
- **Latency:** 50-150ms for first audio chunk
- **Raspberry Pi 5:** 0.54 seconds inference for short sentences
- **Google Colab (float16):** RTF of 0.192

### Language Support
35+ languages including:
- English (US/UK)
- Chinese (Mandarin)
- Spanish, French, German
- Japanese, Korean
- Arabic, Hindi, Russian

### Quality Assessment
- **Quality Tier:** Mid-range naturalness
- **MOS Score:** ~3.5-4.0 (estimated)
- **Pros:** Clear, intelligible speech
- **Cons:** Less expressive than larger models

### License & Usage
- **License:** MIT (fully permissive)
- **Commercial Use:** ✅ Allowed
- **Training Data:** Openly licensed voices

### Docker Availability
```bash
# Pre-built Docker images available
docker build -t piper-tts .
docker run -it piper-tts
```

### API Compatibility
- **Native:** Command-line and Python bindings
- **OpenAI Compatible:** Via community wrappers
- **Integration:** Direct ONNX model loading

### Best Use Case
✅ **Edge devices, Home Assistant, offline applications, resource-constrained environments**

---

## 2. Kokoro-82M

### Overview
Kokoro-82M is a lightweight yet high-quality TTS model with just 82 million parameters. It ranks #1 on the TTS Spaces Arena, outperforming much larger models.

### Technical Specifications
- **Model Size:** 82M parameters (~200MB with voices)
- **VRAM Required:** 2-4 GB (GPU), runs on CPU too
- **Architecture:** StyleTTS 2 + ISTFTNet (decoder-only)
- **Sample Rate:** 24 kHz
- **Training Data:** <100 hours of audio

### Performance Characteristics
- **Real-Time Factor (RTF):** ~0.01 (100x faster than real-time on GPU)
- **Latency:** 
  - GPU: 51-84ms (first chunk)
  - CPU: ~1s (M3 Pro)
- **Throughput:** 137.67 tokens/second

### Language Support
- English (American, British)
- Japanese, Chinese (limited)
- 9 languages total with community packs

### Quality Assessment
- **Quality Tier:** High - Matches models 10x larger
- **Elo Rating:** #1 on TTS Spaces Arena
- **Pros:** Excellent quality-to-size ratio, very fast
- **Cons:** No voice cloning, limited languages

### License & Usage
- **License:** Apache 2.0 (fully permissive)
- **Commercial Use:** ✅ Allowed
- **Training Cost:** ~$400 (500 GPU hours on A100)

### Docker Availability
```bash
# Official Docker images
docker run --gpus all -p 8880:8880 ghcr.io/remsky/kokoro-fastapi-gpu:latest
docker run -p 8880:8880 ghcr.io/remsky/kokoro-fastapi-cpu:latest
```

### API Compatibility
- ✅ **OpenAI-Compatible API** via Kokoro-FastAPI
- **WebSocket Streaming:** Supported
- **Voice Mixing:** Combine voices (e.g., "af_bella+af_sky")

### Best Use Case
✅ **Real-time voice AI, low-latency applications, resource-efficient deployment**

---

## 3. MeloTTS

### Overview
MeloTTS is a high-quality multilingual TTS library with fast CPU real-time inference capabilities.

### Technical Specifications
- **Model Size:** ~100M parameters
- **VRAM Required:** 4-6 GB (GPU), CPU capable
- **Architecture:** Transformer-based acoustic model
- **Sample Rate:** 44.1 kHz

### Performance Characteristics
- **Latency:** 200-230ms for 100 characters (G5 AWS instance)
- **Real-Time Factor:** 0.05 (20x faster than real-time)
- **Speed Control:** 0.5x to 2.0x

### Language Support
- English (US, UK, Indian, Australian, Default)
- Chinese (with English mixing)
- Spanish, French, Japanese, Korean
- Portuguese, Arabic

### Quality Assessment
- **Quality Tier:** Good
- **Pros:** Clean pronunciation, speed control, Chinese-English mixing
- **Cons:** Slightly robotic compared to larger models

### License & Usage
- **License:** MIT (fully permissive)
- **Commercial Use:** ✅ Allowed

### Docker Availability
```bash
# Available via Docker
docker run -p 8080:8080 melotts-server
```

### API Compatibility
- **REST API:** Available
- **FastAPI Server:** Community implementations
- **Integration:** Python API

### Best Use Case
✅ **Multilingual applications, Chinese TTS, CPU-constrained environments**

---

## 4. Sherpa-ONNX TTS

### Overview
Sherpa-ONNX is a fast speech recognition and TTS toolkit using ONNX Runtime. It supports various TTS models (including MeloTTS, Piper) with unified ONNX inference.

### Technical Specifications
- **Model Size:** Varies by model
- **VRAM Required:** 0-2 GB (optimized for CPU)
- **Runtime:** ONNX Runtime (CPU/GPU)
- **Formats:** ONNX models

### Performance Characteristics
- **Real-Time Factor:** 0.017 (sense voice model)
- **Latency:** 30-100ms for first chunk
- **GPU Acceleration:** Metal (macOS), CUDA, DirectML

### Language Support
Depends on model used:
- Supports all Piper models (35+ languages)
- Supports MeloTTS models
- SenseVoice: 100+ languages

### Quality Assessment
- **Quality Tier:** Varies by underlying model
- **Pros:** Unified inference engine, cross-platform, mobile-optimized
- **Cons:** Quality depends on selected model

### License & Usage
- **License:** Apache 2.0
- **Commercial Use:** ✅ Allowed

### Docker Availability
```bash
# Available with various model configurations
docker run sherpa-onnx-tts
```

### API Compatibility
- **Native C++ API:** With Python bindings
- **Streaming:** Supported
- **Model Zoo:** Pre-converted ONNX models

### Best Use Case
✅ **Cross-platform deployment, mobile apps, unified TTS pipeline**

---

## 5. Coqui XTTS-v2

### Overview
XTTS-v2 is a state-of-the-art zero-shot multilingual TTS model capable of voice cloning from just 6 seconds of audio.

### Technical Specifications
- **Model Size:** 467M parameters (~2GB)
- **VRAM Required:** 6-8 GB minimum, 12GB+ recommended
- **Architecture:** GPT-2 based with diffusion decoder
- **Sample Rate:** 24 kHz

### Performance Characteristics
- **Latency:** 1-3 seconds (not suitable for <200ms requirement)
- **Real-Time Factor:** 0.3-0.5
- **Voice Cloning Time:** 6-30 seconds reference audio

### Language Support
17 languages:
- English, Spanish, French, German
- Italian, Portuguese, Polish, Turkish
- Russian, Dutch, Czech, Arabic
- Chinese, Japanese, Hungarian
- Korean, Hindi

### Quality Assessment
- **Quality Tier:** Very High
- **Voice Cloning:** Excellent (85-95% similarity)
- **Pros:** Best-in-class voice cloning, multilingual
- **Cons:** Higher latency, not real-time capable

### License & Usage
- **License:** Mozilla Public License 2.0 (MPL 2.0)
- **Commercial Use:** ✅ Allowed with attribution
- **Company Status:** Coqui AI shut down in Dec 2024, community-maintained

### Docker Availability
```bash
docker run --gpus all -p 5000:5000 xtts-server
```

### API Compatibility
- **REST API:** Available via xtts-api-server
- **Python API:** Native TTS library
- **Streaming:** Limited support

### Best Use Case
✅ **Voice cloning, audiobooks, content creation, non-real-time applications**

---

## 6. F5-TTS

### Overview
F5-TTS is a diffusion-based TTS model using flow matching for high-quality speech synthesis. Released in late 2024, it represents the latest in diffusion TTS technology.

### Technical Specifications
- **Model Size:** ~1B parameters (base model)
- **VRAM Required:** 6-8 GB
- **Architecture:** Diffusion Transformer with ConvNeXt V2
- **Sample Rate:** 24 kHz

### Performance Characteristics
- **Latency:** 200-300ms (with optimization)
- **Real-Time Factor:** 0.04 (25x faster with TensorRT-LLM)
- **Benchmark:** 
  - Sub-7 seconds for 200 words
  - RTF: 0.0394 (Triton server, L20 GPU)

### Language Support
- English (primary)
- Chinese (v1 release)
- Multilingual support expanding

### Quality Assessment
- **Quality Tier:** High
- **Pros:** Very natural speech, good voice cloning
- **Cons:** Requires GPU, model is non-commercial

### License & Usage
- **Code:** MIT License
- **Models:** CC-BY-NC (Non-Commercial)
- **Commercial Use:** ❌ Models cannot be used commercially

### Docker Availability
```bash
docker build -t f5tts:v1 .
docker run --rm -it --gpus=all -p 7860:7860 ghcr.io/swivid/f5-tts:main
```

### API Compatibility
- **Gradio Interface:** Built-in
- **CLI:** Available
- **Triton/TensorRT-LLM:** For production deployment

### Best Use Case
✅ **Research, non-commercial high-quality TTS, voice cloning experimentation**

---

## 7. Zonos (Zyphra)

### Overview
Zonos-v0.1 is a leading open-weight expressive TTS model with high-fidelity voice cloning capabilities, released by Zyphra in February 2025.

### Technical Specifications
- **Model Size:** 1.6B parameters (Transformer or SSM Hybrid)
- **VRAM Required:** 8-10 GB (6GB minimum)
- **Architecture:** Transformer or SSM (Mamba2) Hybrid
- **Sample Rate:** 44 kHz (native)

### Performance Characteristics
- **Latency:** 200-300ms (TTFA - Time To First Audio)
- **Real-Time Factor:** ~2.0 on RTX 4090
- **Throughput:** 774 tokens per second of audio

### Language Support
- English (primary)
- Chinese, Japanese, French, German, Spanish (substantial data)
- Other languages (limited performance)

### Quality Assessment
- **Quality Tier:** Excellent (matches/exceeds ElevenLabs)
- **Voice Cloning:** High-fidelity with 5-30 seconds
- **Pros:** Expressive control, emotions, 44kHz output
- **Cons:** Occasional artifacts at boundaries, word skipping

### License & Usage
- **License:** Apache 2.0 (fully permissive)
- **Commercial Use:** ✅ Allowed
- **Training Data:** 200,000+ hours of speech

### Docker Availability
```bash
git clone https://github.com/Zyphra/Zonos.git
cd Zonos
docker compose up
```

### API Compatibility
- **Gradio WebUI:** Built-in
- **Python API:** Native
- **Hosted API:** Available at playground.zyphra.com

### Best Use Case
✅ **Production voice AI, expressive speech, high-quality voice cloning**

---

## 8. StyleTTS 2

### Overview
StyleTTS 2 leverages style diffusion and adversarial training with large speech language models to achieve human-level TTS synthesis.

### Technical Specifications
- **Model Size:** ~200M parameters
- **VRAM Required:** 4-6 GB
- **Architecture:** Style diffusion + adversarial training
- **Sample Rate:** 24 kHz

### Performance Characteristics
- **Latency:** 100-200ms
- **Real-Time Factor:** 0.01-0.05
- **Inference Speed:** Up to 95x real-time on RTX 4090

### Language Support
- English (native)
- Multilingual PL-BERT: 14 languages
- Japanese, Chinese (with custom PL-BERT)

### Quality Assessment
- **Quality Tier:** Human-level on some datasets
- **MOS Scores:** Surpasses human recordings on LJSpeech
- **Pros:** Exceptional quality, style control
- **Cons:** Complex setup, training can be unstable

### License & Usage
- **Code:** MIT License
- **Pre-trained Models:** Custom license (disclosure required)
- **Commercial Use:** ⚠️ With attribution and disclosure

### Docker Availability
- Community Docker images available
- Primarily source installation

### API Compatibility
- **Python API:** Available
- **Jupyter Notebooks:** Inference examples
- **Streaming:** Community implementations

### Best Use Case
✅ **Research, audiobooks, high-fidelity content creation**

---

## LiveKit Agents Integration Guide

### OpenAI-Compatible TTS Servers

For LiveKit Agents integration, the following TTS systems can expose OpenAI-compatible APIs:

#### 1. Kokoro-FastAPI (Recommended for Low Latency)
```python
# Start the server
docker run --gpus all -p 8880:8880 ghcr.io/remsky/kokoro-fastapi-gpu:latest

# LiveKit configuration
# Use OpenAI plugin with custom base_url
```

#### 2. Piper HTTP Server
```bash
# Run Piper HTTP server
python3 -m piper.http_server --model en_US-lessac-medium.onnx
```

#### 3. MeloTTS API Server
```bash
# Run MeloTTS FastAPI server
python -m melotts.api_server
```

### Creating Custom LiveKit TTS Plugin

```python
from livekit.agents import tts
from typing import Optional
import aiohttp

class CustomTTS(tts.TTS):
    def __init__(
        self,
        base_url: str,
        voice: str,
        api_key: Optional[str] = None,
    ):
        self.base_url = base_url
        self.voice = voice
        self.api_key = api_key
    
    async def synthesize(self, text: str) -> tts.SynthesizedAudio:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/v1/audio/speech",
                json={
                    "model": "tts-model",
                    "input": text,
                    "voice": self.voice,
                    "response_format": "pcm"
                }
            ) as resp:
                audio_data = await resp.read()
                return tts.SynthesizedAudio(
                    data=audio_data,
                    sample_rate=24000,
                    num_channels=1
                )
```

### Recommended Setup for LiveKit Agents

#### Option A: Ultra-Low Latency (<100ms)
```
TTS: Kokoro-82M (GPU)
Latency: 51-84ms
Use case: Real-time conversations, voice agents
```

#### Option B: Edge/On-Premise (No GPU)
```
TTS: Piper TTS or Sherpa-ONNX (CPU)
Latency: 50-150ms
Use case: Embedded devices, offline systems
```

#### Option C: Voice Cloning Required
```
TTS: Zonos or F5-TTS (with trade-offs)
Latency: 200-300ms
Use case: Personalized voice agents
```

---

## Latency Benchmarks Summary

| TTS System | First Chunk Latency | RTF | GPU Required |
|------------|---------------------|-----|--------------|
| **Kokoro-82M** | **51-84ms** | 0.01 | Optional |
| **Piper TTS** | 50-150ms | 0.19 | No |
| **Sherpa-ONNX** | 30-100ms | 0.017 | No |
| **StyleTTS 2** | 100-200ms | 0.01-0.05 | Yes |
| **MeloTTS** | 200-230ms | 0.05 | Optional |
| **F5-TTS** | 200-300ms | 0.04 | Yes |
| **Zonos** | 200-300ms | 0.5 | Yes |
| **XTTS-v2** | 1-3s | 0.3-0.5 | Yes |

---

## Final Recommendations

### For LiveKit Agents - Real-time Voice AI

**Primary Recommendation: Kokoro-82M**
- ✅ Sub-100ms latency
- ✅ OpenAI-compatible API available
- ✅ Apache 2.0 license (commercial use)
- ✅ Easy Docker deployment

**Alternative: Piper TTS**
- ✅ No GPU required
- ✅ Extremely lightweight
- ✅ 35+ languages
- ✅ MIT license

### For Voice Cloning Applications

**Primary: Zonos**
- ✅ Apache 2.0 license
- ✅ High-fidelity cloning
- ✅ Expressive control
- ⚠️ 200-300ms latency

**Alternative: XTTS-v2**
- ✅ Excellent voice cloning
- ✅ 17 languages
- ⚠️ Higher latency (1-3s)
- ⚠️ Community-maintained

### For Multilingual Support

**Primary: MeloTTS via Sherpa-ONNX**
- ✅ 10+ languages
- ✅ Chinese-English mixing
- ✅ CPU capable

---

## Docker Compose Example

```yaml
version: '3.8'

services:
  # Option 1: Kokoro TTS (Recommended)
  kokoro-tts:
    image: ghcr.io/remsky/kokoro-fastapi-gpu:latest
    ports:
      - "8880:8880"
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  # Option 2: Piper TTS (CPU)
  piper-tts:
    image: rhasspy/wyoming-piper
    ports:
      - "10200:10200"
    volumes:
      - ./piper-voices:/data

  # Option 3: Zonos (Voice Cloning)
  zonos-tts:
    image: zonos-tts:latest
    build: 
      context: ./Zonos
    ports:
      - "7860:7860"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

---

## References

1. Piper TTS: https://github.com/rhasspy/piper
2. Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
3. MeloTTS: https://github.com/myshell-ai/MeloTTS
4. Sherpa-ONNX: https://github.com/k2-fsa/sherpa-onnx
5. XTTS-v2: https://huggingface.co/coqui/XTTS-v2
6. F5-TTS: https://github.com/SWivid/F5-TTS
7. Zonos: https://github.com/Zyphra/Zonos
8. StyleTTS 2: https://github.com/yl4579/StyleTTS2
9. LiveKit Agents: https://docs.livekit.io/agents/

---

*Research compiled: January 31, 2026*
*For questions or updates, refer to the official repositories linked above.*
