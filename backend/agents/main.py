"""
LiveKit Agent Entry Point with Hybrid AI Configuration

This is the production-ready agent entry point that uses the hybrid
configuration system to support both API and local AI providers.

Features:
- Hybrid provider support (API + Local with fallback)
- Per-project configuration loading
- Latency monitoring
- Health checks
- Multiple agent modes (voice, text, multimodal)

Usage:
    # Development with hot reload
    python main.py dev
    
    # Production
    python main.py start
    
    # Console testing (local audio)
    python main.py console

Environment Variables:
    LIVEKIT_URL - WebSocket URL for LiveKit server
    LIVEKIT_API_KEY - API key for authentication
    LIVEKIT_API_SECRET - API secret for authentication
    AGENT_MODE - Mode: api, local, hybrid (default: hybrid)
    
    See hybrid_config.py for full list of configuration options.
"""

import os
import asyncio
import logging
from typing import Optional

from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobProcess,
    WorkerOptions,
    AutoSubscribe,
    cli,
    function_tool,
    RunContext,
)

from hybrid_config import (
    HybridProviderManager,
    ProjectAIConfig,
    create_hybrid_session,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# =============================================================================
# AGENT DEFINITION
# =============================================================================

class VoiceAssistant(Agent):
    """
    Base voice assistant agent with hybrid AI providers
    
    Extend this class to customize behavior, add tools, etc.
    """
    
    def __init__(
        self,
        instructions: Optional[str] = None,
        **kwargs
    ):
        default_instructions = """You are a friendly and helpful voice assistant.
        
Your goals:
- Help users with their questions and tasks
- Be conversational and natural
- Keep responses concise for voice interaction
- Ask clarifying questions when needed

Remember: You're speaking, not writing, so keep responses brief and natural."""

        super().__init__(
            instructions=instructions or default_instructions,
            **kwargs
        )
    
    async def on_enter(self):
        """Called when agent enters conversation"""
        # Generate a greeting
        await self.session.generate_reply(
            instructions="Greet the user warmly and ask how you can help them today."
        )
    
    async def on_user_turn_completed(self, turn_ctx):
        """Called after user finishes speaking"""
        # Log latency metrics
        if hasattr(turn_ctx, 'metrics'):
            logger.info(f"Turn latency: {turn_ctx.metrics}")


# =============================================================================
# FUNCTION TOOLS (Examples)
# =============================================================================

@function_tool
async def get_current_time(context: RunContext) -> dict:
    """Get the current time. Use when user asks what time it is."""
    from datetime import datetime
    now = datetime.now()
    return {
        "time": now.strftime("%I:%M %p"),
        "date": now.strftime("%B %d, %Y"),
    }


@function_tool
async def set_reminder(
    context: RunContext,
    reminder_text: str,
    minutes: int = 5,
) -> dict:
    """
    Set a reminder for the user.
    
    Args:
        reminder_text: What to remind the user about
        minutes: How many minutes from now to remind (default 5)
    """
    # In production, this would integrate with a reminder system
    return {
        "status": "success",
        "message": f"I'll remind you about '{reminder_text}' in {minutes} minutes.",
    }


# =============================================================================
# WORKER PREWARM
# =============================================================================

def prewarm(proc: JobProcess):
    """
    Prewarm function - load heavy resources before accepting jobs
    
    This runs once when the worker starts, before any jobs are assigned.
    Use it to pre-load models and warm up connections.
    """
    logger.info("Prewarming agent worker...")
    
    # Load configuration
    config = ProjectAIConfig()
    proc.userdata["config"] = config
    
    # Pre-warm the hybrid provider manager
    manager = HybridProviderManager(config)
    
    # Pre-load VAD (always needed)
    logger.info("Loading VAD model...")
    proc.userdata["vad"] = manager.get_vad()
    
    # Pre-load turn detector
    logger.info("Loading turn detector...")
    proc.userdata["turn_detector"] = manager.get_turn_detector()
    
    logger.info("Prewarm complete!")


# =============================================================================
# AGENT ENTRYPOINT
# =============================================================================

async def entrypoint(ctx: JobContext):
    """
    Main entrypoint for agent sessions
    
    This is called for each new room/participant connection.
    """
    logger.info(f"Starting agent for room: {ctx.room.name}")
    
    # Get prewarmed resources
    config = ctx.proc.userdata.get("config", ProjectAIConfig())
    vad = ctx.proc.userdata.get("vad")
    turn_detector = ctx.proc.userdata.get("turn_detector")
    
    # Connect to room (audio only for voice agent)
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    
    # Wait for a participant to join
    participant = await ctx.wait_for_participant()
    logger.info(f"Participant joined: {participant.identity}")
    
    # Create hybrid provider manager
    manager = HybridProviderManager(config)
    
    # Create agent session with hybrid providers
    session = AgentSession(
        vad=vad or manager.get_vad(),
        stt=manager.get_stt(),
        llm=manager.get_llm(),
        tts=manager.get_tts(),
        turn_detection=turn_detector or manager.get_turn_detector(),
        # Latency optimizations
        min_endpointing_delay=0.15,
        max_endpointing_delay=2.0,
    )
    
    # Create agent with tools
    agent = VoiceAssistant(
        tools=[
            get_current_time,
            set_reminder,
        ],
    )
    
    # Start the session
    await session.start(
        agent=agent,
        room=ctx.room,
        participant=participant,
    )
    
    logger.info("Agent session started successfully")


# =============================================================================
# LOCAL TESTING ENTRYPOINT
# =============================================================================

async def local_entrypoint(ctx: JobContext):
    """
    Simplified entrypoint for local testing with console mode
    """
    # Use local mode by default for console testing
    os.environ.setdefault("AGENT_MODE", "local")
    
    config = ProjectAIConfig()
    manager = HybridProviderManager(config)
    
    session = manager.create_agent_session()
    
    agent = VoiceAssistant(
        instructions="You are a helpful assistant for local testing. Keep responses very brief."
    )
    
    await ctx.connect()
    
    await session.start(
        agent=agent,
        room=ctx.room,
    )


# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    # Check if running in console mode (local testing)
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "console":
        cli.run_app(
            WorkerOptions(
                entrypoint_fnc=local_entrypoint,
            )
        )
    else:
        # Production mode with prewarm
        cli.run_app(
            WorkerOptions(
                entrypoint_fnc=entrypoint,
                prewarm_fnc=prewarm,
            )
        )
