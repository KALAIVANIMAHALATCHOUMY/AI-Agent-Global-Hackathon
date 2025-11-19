import boto3
from strands.models import BedrockModel
from strands import Agent

# Create a custom boto3 session
session = boto3.Session(
    aws_access_key_id='',
    aws_secret_access_key='',
    aws_session_token='',
    region_name='us-east-1',
)

# Create a Bedrock model with the custom session
model = BedrockModel(
    model_id="arn:aws:bedrock:us-east-1:550226822135:inference-profile/us.anthropic.claude-3-sonnet-20240229-v1:0",
    boto_session=session,
     temperature=0.3,
)
    # region="us-east-1"


messages=[
    {"role": "user", "content": [{"text": "Hello, my name is Doctor!"}]},
    {"role": "assistant", "content": [{"text": "Hi there! How can I help you today?"}]}
]

# Create an agent using the BedrockModel instance
agent = Agent(model=model, messages=messages)

# Use the agent
response = agent("hi")
# By Default, the agent prints the model output to stdout


print("Response:", response)  # Prints model output to stdout by default

print("_-------------------------------------")

print("response.message:", response.message)

print("")

print("agent message", agent.messages)

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



# Hello! It's nice to meet you, Doctor. How are you doing today?Response: Hello! It's nice to meet you, Doctor. How are you doing today?

# _-------------------------------------
# response.message: {'role': 'assistant', 'content': [{'text': "Hello! It's nice to meet you, Doctor. How are you doing today?"}]}
# ________
# agent message [{'role': 'user', 'content': [{'text': 'Hello, my name is Doctor!'}]}, {'role': 'assistant', 'content': [{'text': 'Hi there! How can I help you today?'}]}, {'role': 'user', 'content': [{'text': 'hi'}]}, {'role': 'assistant', 'content': [{'text': "Hello! It's nice to meet you, Doctor. How are you doing today?"}]}]