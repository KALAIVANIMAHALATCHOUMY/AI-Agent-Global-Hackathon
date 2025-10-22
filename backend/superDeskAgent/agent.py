from strands import Agent, tool
from strands_tools import calculator, current_time
from strands.models.gemini import GeminiModel
from strands_tools import calculator
import logging
import json
import re

from dotenv import load_dotenv
import os
load_dotenv() 
gemini_key = os.getenv("GOOGLE_API_KEY")

system_prompt = (
    "You are a Gen AI Expert employed by our company, specializing in IT asset management, IT operations, and services. "
    "You are equipped with access to a suite of tools to gather real-time information and provide personalized advice and recommendations tailored to IT users' needs. "
    "Your primary role is to assist IT users by accelerating their workflows, quickly identifying the root cause of issues, and delivering effective fixes or solutions to enhance productivity and resolve problems efficiently."
)

state = {
    "superDesk": {
        "name": "superDesk.AI",
        "description": "An AI-powered assistant designed to enhance IT support team efficiency by managing and resolving tickets effectively. It analyzes ticket data, provides actionable solution suggestions, and automates routine tasks to optimize service desk operations and improve response times.",
    }
}


# logging.getLogger("strands").setLevel(logging.DEBUG)

# # Sets the logging format and streams logs to stderr
# logging.basicConfig(
#     format="%(levelname)s | %(name)s | %(message)s",
#     handlers=[logging.StreamHandler()]
# )


model = GeminiModel(
    client_args={
        "api_key": gemini_key,
    },
    # **model_config
    model_id="gemini-2.5-flash",
    params={
        # some sample model parameters 
        "temperature": 0.7,
        "max_output_tokens": 8000,
        "top_p": 0.9,
        "top_k": 40
    }
)



# Global message history (to be updated per session)
messages = []

def create_agent(query: str):
    """
    Create and run an Agent instance with the given query, managing message history.

    Args:
        query (str): The user query to process.

    Returns:
        dict: Response containing the agent's reply and updated message history.
    """
    print("create_agent called with query:", query)
    global messages


    # Add the new user message to history
    user_message = {"role": "user", "content": [{"text": query}]}
    messages.append(user_message)
    print("Current message history:", messages)

    # Initialize or reinitialize Agent with current messages
    agent = Agent(
        model=model,
        tools=[current_time, './superDeskTools.py'],
        state=state,
        system_prompt=system_prompt,
        # messages=messages  # Pass the current message history
    )
    print("Agent initialized.")


    # Get response from agent
    response = agent(query)
    print("immediate response:", response)

    # Add assistant response to history
    assistant_message = {"role": "assistant", "content": [{"text": response}]}
    messages.append(assistant_message)

    print("after response", response, type(response))

    # Return response and current message history
    return {
        "response": str(response.message["content"][0]["text"]),
        "message_history": agent.messages
    }


# print(create_agent("who r u?"))


# agent.py
def _extract_json_block(text: str) -> str:
    """
    Extract the first top-level JSON object from a text response.
    """
    if not text:
        return "{}"
    # Find first '{' and last '}' to attempt a robust slice
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return "{}"
    candidate = text[start:end+1]
    return candidate

def generate_troubleshooting_flow(issue: str) -> dict:
    """
    Ask the LLM to produce a strict JSON flow chart for the given issue.
    The schema includes: title, nodes[], edges[], steps[].
    Each node: { id, label, action, tool? }, each edge: { source, target, label? }.
    """
    prompt = f"""
You are an IT troubleshooting expert.
Return ONLY valid JSON for a flow chart, no markdown fences or commentary.

Schema:
{{
  "title": "string",
  "nodes": [
    {{"id":"string","label":"string","action":"string","tool": "string|null"}}
  ],
  "edges": [
    {{"source":"string","target":"string","label":"string"}}
  ],
  "steps": ["string", "string", "..."]
}}

Rules:
- Use short ids like "start","logs","drivers","done","escalate".
- Prefer tools from this set when relevant: ["check_network","get_recent_logs","system_health_summary","check_battery_status","wifi_signal_details","wifi_signal_strength","dns_latency_check","disk_smart_status","list_audio_devices","list_installed_apps"].
- Keep nodes under 12 items and edges clear.
- Make the flow actionable and specific for: {issue}.
"""

    # Reuse the same strands Agent + model so behavior is consistent with /api/chat
    agent = Agent(
        model=model,
        tools=[current_time, './superDeskTools.py'],
        state=state,
        system_prompt="Return JSON only following the provided schema."
    )
    raw = agent(prompt)
    text = str(raw.message["content"][0]["text"])
    json_text = _extract_json_block(text)
    try:
        data = json.loads(json_text)
    except Exception:
        data = {}
    # Minimal validation
    data.setdefault("title", f"Troubleshooter: {issue}")
    data.setdefault("nodes", [])
    data.setdefault("edges", [])
    data.setdefault("steps", [])
    return data
