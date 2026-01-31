"""
Hybrid Configuration Manager for LiveKit Agents
Supports API, Local, and Hybrid modes with per-project configuration
Enables admin users to configure AI providers for their projects with automatic fallback

Features:
- Environment variable configuration (default)
- Per-project database configuration (override)
- Automatic fallback from API to local models
- Support for multiple STT/TTS/LLM providers
- Low-latency optimization targeting <800ms end-to-end
"""

import os
import asyncio
from typing import Optional, Literal, Dict, Any, List
from dataclasses import dataclass, field
from functools import lru_cache
import logging

# LiveKit Agents imports
from livekit.agents import stt, tts, llm, AgentSession
from livekit.plugins import openai, silero, turn_detector

# Try importing optional providers
try:
    from livekit.plugins import deepgram
    HAS_DEEPGRAM = True
except ImportError:
    HAS_DEEPGRAM = False

try:
    from livekit.plugins import cartesia
    HAS_CARTESIA = True
except ImportError:
    HAS_CARTESIA = False

try:
    from livekit.plugins import elevenlabs
    HAS_ELEVENLABS = True
except ImportError:
    HAS_ELEVENLABS = False

try:
    from livekit.plugins import anthropic
    HAS_ANTHROPIC = True
except ImportError:
    HAS_ANTHROPIC = False

try:
    from livekit.plugins import groq
    HAS_GROQ = True
except ImportError:
    HAS_GROQ = False

logger = logging.getLogger(__name__)

# Type definitions
Mode = Literal["api", "local", "hybrid", "project"]
STTProvider = Literal["openai", "deepgram", "groq", "assemblyai", "local"]
TTSProvider = Literal["openai", "cartesia", "elevenlabs", "deepgram", "local"]
LLMProvider = Literal["openai", "anthropic", "groq", "local"]


@dataclass
class ProjectAIConfig:
    """
    Per-project AI configuration stored in database or environment
    
    This configuration can be:
    1. Loaded from environment variables (default for all projects)
    2. Loaded from database (per-project override)
    3. Passed directly during agent session creation
    """
    project_id: str = "default"
    
    # Mode Configuration
    mode: Mode = "hybrid"
    
    # STT Configuration
    stt_mode: Mode = "hybrid"
    stt_primary_provider: STTProvider = "deepgram"
    stt_fallback_provider: Optional[STTProvider] = "local"
    stt_local_model: str = "small"  # tiny, base, small, medium, large-v3-turbo
    stt_local_compute: str = "int8"  # int8, float16
    stt_local_device: str = "cpu"  # cpu, cuda
    
    # TTS Configuration
    tts_mode: Mode = "hybrid"
    tts_primary_provider: TTSProvider = "cartesia"
    tts_fallback_provider: Optional[TTSProvider] = "local"
    tts_local_implementation: str = "kokoro"  # kokoro, piper, melotts
    tts_local_voice: str = "af_bella"  # Kokoro voice
    
    # LLM Configuration  
    llm_mode: Mode = "hybrid"
    llm_primary_provider: LLMProvider = "openai"
    llm_primary_model: str = "gpt-4o-mini"
    llm_fallback_provider: Optional[LLMProvider] = "local"
    llm_local_model: str = "llama3.2:3b"
    
    # VAD Configuration (always local)
    vad_threshold: float = 0.5
    vad_min_speech_duration: float = 0.15
    vad_min_silence_duration: float = 0.3
    
    # Turn Detection Configuration (always local)
    turn_detector_model: str = "multilingual"  # english, multilingual
    
    # Latency Targets (for monitoring)
    target_latency_ms: int = 800
    
    # Local Service URLs
    whisper_local_url: str = "http://localhost:8000/v1"
    kokoro_local_url: str = "http://localhost:8880/v1"
    piper_local_url: str = "http://localhost:10200/v1"
    ollama_local_url: str = "http://localhost:11434/v1"


class HybridProviderManager:
    """
    Manages hybrid AI providers with automatic fallback
    
    Usage:
        # From environment variables
        manager = HybridProviderManager()
        
        # From database config
        config = load_project_config(project_id)  
        manager = HybridProviderManager(config)
        
        # Create agent session
        session = manager.create_agent_session()
    """
    
    def __init__(self, config: Optional[ProjectAIConfig] = None):
        """
        Initialize the provider manager
        
        Args:
            config: Optional project configuration. If None, loads from environment.
        """
        self.config = config or self._load_from_env()
        self._stt_instances: Dict[str, stt.STT] = {}
        self._tts_instances: Dict[str, tts.TTS] = {}
        self._llm_instances: Dict[str, llm.LLM] = {}
        
    def _load_from_env(self) -> ProjectAIConfig:
        """Load configuration from environment variables"""
        return ProjectAIConfig(
            project_id="default",
            mode=os.getenv("AGENT_MODE", "hybrid"),
            
            # STT from env
            stt_mode=os.getenv("AGENT_MODE", "hybrid"),
            stt_primary_provider=os.getenv("STT_PROVIDER", "deepgram"),
            stt_fallback_provider=os.getenv("STT_FALLBACK_PROVIDER", "local"),
            stt_local_model=os.getenv("WHISPER_MODEL", "small"),
            stt_local_compute=os.getenv("WHISPER_COMPUTE_TYPE", "int8"),
            stt_local_device=os.getenv("WHISPER_DEVICE", "cpu"),
            
            # TTS from env
            tts_mode=os.getenv("AGENT_MODE", "hybrid"),
            tts_primary_provider=os.getenv("TTS_PROVIDER", "cartesia"),
            tts_fallback_provider=os.getenv("TTS_FALLBACK_PROVIDER", "local"),
            tts_local_implementation=os.getenv("TTS_IMPLEMENTATION", "kokoro"),
            tts_local_voice=os.getenv("KOKORO_VOICE", "af_bella"),
            
            # LLM from env
            llm_mode=os.getenv("AGENT_MODE", "hybrid"),
            llm_primary_provider=os.getenv("LLM_PROVIDER", "openai"),
            llm_primary_model=os.getenv("LLM_MODEL", "gpt-4o-mini"),
            llm_fallback_provider=os.getenv("LLM_FALLBACK_PROVIDER", "local"),
            llm_local_model=os.getenv("LOCAL_LLM_MODEL", "llama3.2:3b"),
            
            # VAD from env
            vad_threshold=float(os.getenv("VAD_THRESHOLD", "0.5")),
            vad_min_speech_duration=float(os.getenv("VAD_MIN_SPEECH_DURATION", "0.15")),
            vad_min_silence_duration=float(os.getenv("VAD_MIN_SILENCE_DURATION", "0.3")),
            
            # Turn detector from env
            turn_detector_model=os.getenv("TURN_DETECTOR_MODEL", "multilingual"),
            
            # Local URLs from env
            whisper_local_url=os.getenv("WHISPER_LOCAL_URL", "http://localhost:8000/v1"),
            kokoro_local_url=os.getenv("KOKORO_URL", "http://localhost:8880/v1"),
            piper_local_url=os.getenv("PIPER_URL", "http://localhost:10200/v1"),
            ollama_local_url=os.getenv("LOCAL_LLM_URL", "http://localhost:11434/v1"),
        )
    
    # ============================================================
    # STT (Speech-to-Text) Providers
    # ============================================================
    
    def get_stt(self) -> stt.STT:
        """
        Get STT provider based on configuration
        
        Returns:
            STT instance with fallback if configured
        """
        mode = self.config.stt_mode
        
        if mode == "api":
            return self._get_api_stt(self.config.stt_primary_provider)
        
        elif mode == "local":
            return self._get_local_stt()
        
        elif mode == "hybrid":
            providers = []
            
            # Primary API provider
            try:
                primary = self._get_api_stt(self.config.stt_primary_provider)
                providers.append(primary)
            except Exception as e:
                logger.warning(f"Failed to initialize primary STT: {e}")
            
            # Fallback to local
            if self.config.stt_fallback_provider == "local":
                try:
                    fallback = self._get_local_stt()
                    providers.append(fallback)
                except Exception as e:
                    logger.warning(f"Failed to initialize fallback STT: {e}")
            
            if not providers:
                raise RuntimeError("No STT providers available")
            
            if len(providers) == 1:
                return providers[0]
            
            return stt.FallbackAdapter(providers)
        
        raise ValueError(f"Unknown STT mode: {mode}")
    
    def _get_api_stt(self, provider: STTProvider) -> stt.STT:
        """Get API-based STT provider"""
        if provider == "deepgram" and HAS_DEEPGRAM:
            return deepgram.STT(
                model="nova-3",
                language="multi",
                interim_results=True,
                smart_format=True,
            )
        elif provider == "openai":
            return openai.STT(model="gpt-4o-mini-transcribe")
        elif provider == "groq":
            return openai.STT.with_groq(model="whisper-large-v3-turbo")
        
        # Default to OpenAI
        logger.warning(f"Unknown STT provider {provider}, falling back to OpenAI")
        return openai.STT(model="whisper-1")
    
    def _get_local_stt(self) -> stt.STT:
        """
        Get local Whisper STT via OpenAI-compatible endpoint
        
        Requires faster-whisper-server running on WHISPER_LOCAL_URL
        """
        return openai.STT(
            model="whisper-1",
            base_url=self.config.whisper_local_url,
            api_key="not-needed",
        )
    
    # ============================================================
    # TTS (Text-to-Speech) Providers
    # ============================================================
    
    def get_tts(self) -> tts.TTS:
        """
        Get TTS provider based on configuration
        
        Returns:
            TTS instance with fallback if configured
        """
        mode = self.config.tts_mode
        
        if mode == "api":
            return self._get_api_tts(self.config.tts_primary_provider)
        
        elif mode == "local":
            return self._get_local_tts()
        
        elif mode == "hybrid":
            providers = []
            
            # Primary API provider
            try:
                primary = self._get_api_tts(self.config.tts_primary_provider)
                providers.append(primary)
            except Exception as e:
                logger.warning(f"Failed to initialize primary TTS: {e}")
            
            # Fallback to local
            if self.config.tts_fallback_provider == "local":
                try:
                    fallback = self._get_local_tts()
                    providers.append(fallback)
                except Exception as e:
                    logger.warning(f"Failed to initialize fallback TTS: {e}")
            
            if not providers:
                raise RuntimeError("No TTS providers available")
            
            if len(providers) == 1:
                return providers[0]
            
            return tts.FallbackAdapter(providers)
        
        raise ValueError(f"Unknown TTS mode: {mode}")
    
    def _get_api_tts(self, provider: TTSProvider) -> tts.TTS:
        """Get API-based TTS provider"""
        if provider == "cartesia" and HAS_CARTESIA:
            return cartesia.TTS(
                model="sonic-3",  # ~40ms TTFB
                voice="71a7ad14-091c-4e8e-a314-022ece01c716",
            )
        elif provider == "elevenlabs" and HAS_ELEVENLABS:
            return elevenlabs.TTS(
                model="eleven_turbo_v2_5",  # ~75ms TTFB
                voice_id="pNInz6obpgDQGcFmaJgB",
            )
        elif provider == "openai":
            return openai.TTS(model="tts-1", voice="alloy")
        
        # Default to OpenAI
        logger.warning(f"Unknown TTS provider {provider}, falling back to OpenAI")
        return openai.TTS(model="tts-1", voice="alloy")
    
    def _get_local_tts(self) -> tts.TTS:
        """
        Get local TTS via OpenAI-compatible endpoint
        
        Supports:
        - Kokoro (recommended): 51-84ms TTFB
        - Piper: 100ms TTFB, CPU only
        """
        implementation = self.config.tts_local_implementation
        
        if implementation == "kokoro":
            return openai.TTS(
                model="kokoro",
                voice=self.config.tts_local_voice,
                base_url=self.config.kokoro_local_url,
                api_key="not-needed",
            )
        elif implementation == "piper":
            return openai.TTS(
                model="piper",
                voice="en_US-lessac-medium",
                base_url=self.config.piper_local_url,
                api_key="not-needed",
            )
        
        # Default to Kokoro
        return openai.TTS(
            model="kokoro",
            voice=self.config.tts_local_voice,
            base_url=self.config.kokoro_local_url,
            api_key="not-needed",
        )
    
    # ============================================================
    # LLM Providers
    # ============================================================
    
    def get_llm(self) -> llm.LLM:
        """
        Get LLM provider based on configuration
        
        Returns:
            LLM instance with fallback if configured
        """
        mode = self.config.llm_mode
        
        if mode == "api":
            return self._get_api_llm(self.config.llm_primary_provider)
        
        elif mode == "local":
            return self._get_local_llm()
        
        elif mode == "hybrid":
            providers = []
            
            # Primary API provider
            try:
                primary = self._get_api_llm(self.config.llm_primary_provider)
                providers.append(primary)
            except Exception as e:
                logger.warning(f"Failed to initialize primary LLM: {e}")
            
            # Fallback to local
            if self.config.llm_fallback_provider == "local":
                try:
                    fallback = self._get_local_llm()
                    providers.append(fallback)
                except Exception as e:
                    logger.warning(f"Failed to initialize fallback LLM: {e}")
            
            if not providers:
                raise RuntimeError("No LLM providers available")
            
            if len(providers) == 1:
                return providers[0]
            
            return llm.FallbackAdapter(providers)
        
        raise ValueError(f"Unknown LLM mode: {mode}")
    
    def _get_api_llm(self, provider: LLMProvider) -> llm.LLM:
        """Get API-based LLM provider"""
        if provider == "openai":
            return openai.LLM(model=self.config.llm_primary_model)
        elif provider == "anthropic" and HAS_ANTHROPIC:
            return anthropic.LLM(model="claude-3-haiku-20240307")
        elif provider == "groq":
            return openai.LLM.with_groq(model="llama-3.1-8b-instant")
        
        # Default to OpenAI
        logger.warning(f"Unknown LLM provider {provider}, falling back to OpenAI")
        return openai.LLM(model="gpt-4o-mini")
    
    def _get_local_llm(self) -> llm.LLM:
        """
        Get local LLM via OpenAI-compatible endpoint (Ollama, vLLM, etc.)
        """
        return openai.LLM(
            model=self.config.llm_local_model,
            base_url=self.config.ollama_local_url,
            api_key="not-needed",
        )
    
    # ============================================================
    # VAD (Always Local)
    # ============================================================
    
    def get_vad(self):
        """
        Get Voice Activity Detection (always local)
        
        Silero VAD runs on CPU with <25ms latency
        """
        return silero.VAD.load(
            min_silence_duration=self.config.vad_min_silence_duration,
            min_speech_duration=self.config.vad_min_speech_duration,
        )
    
    # ============================================================
    # Turn Detection (Always Local)
    # ============================================================
    
    def get_turn_detector(self):
        """
        Get Turn Detection model (always local)
        
        Uses LiveKit's open-weight transformer model
        """
        if self.config.turn_detector_model == "multilingual":
            return turn_detector.MultilingualModel()
        return turn_detector.EnglishModel()
    
    # ============================================================
    # Agent Session Factory
    # ============================================================
    
    def create_agent_session(
        self,
        min_endpointing_delay: float = 0.15,
        max_endpointing_delay: float = 2.0,
        **kwargs
    ) -> AgentSession:
        """
        Create a fully configured AgentSession with hybrid providers
        
        Args:
            min_endpointing_delay: Minimum delay before considering turn complete
            max_endpointing_delay: Maximum delay to wait for turn completion
            **kwargs: Additional arguments passed to AgentSession
        
        Returns:
            Configured AgentSession ready for use
        """
        return AgentSession(
            vad=self.get_vad(),
            stt=self.get_stt(),
            llm=self.get_llm(),
            tts=self.get_tts(),
            turn_detection=self.get_turn_detector(),
            min_endpointing_delay=min_endpointing_delay,
            max_endpointing_delay=max_endpointing_delay,
            **kwargs,
        )


# ============================================================
# Convenience Functions
# ============================================================

def create_hybrid_session(
    project_config: Optional[ProjectAIConfig] = None,
    **kwargs
) -> AgentSession:
    """
    Convenience function to create a hybrid agent session
    
    Args:
        project_config: Optional per-project configuration
        **kwargs: Additional arguments for AgentSession
    
    Returns:
        Configured AgentSession with hybrid providers
    """
    manager = HybridProviderManager(project_config)
    return manager.create_agent_session(**kwargs)


def get_config_from_dict(data: Dict[str, Any]) -> ProjectAIConfig:
    """
    Create ProjectAIConfig from dictionary (useful for database loading)
    
    Args:
        data: Dictionary with configuration values
    
    Returns:
        ProjectAIConfig instance
    """
    return ProjectAIConfig(**data)


# ============================================================
# Example Usage
# ============================================================

if __name__ == "__main__":
    # Example: Load from environment
    manager = HybridProviderManager()
    print(f"Mode: {manager.config.mode}")
    print(f"STT: {manager.config.stt_primary_provider} -> {manager.config.stt_fallback_provider}")
    print(f"TTS: {manager.config.tts_primary_provider} -> {manager.config.tts_fallback_provider}")
    print(f"LLM: {manager.config.llm_primary_provider} -> {manager.config.llm_fallback_provider}")
