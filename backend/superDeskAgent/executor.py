# backend/executor.py
import time
import json

# Example handler mapping: node type -> function
from handlers.kb_search import search_kb
from handlers.news_fetch import fetch_news
from handlers.llm_client import call_llm

def emit(socketio, run_id, event, payload):
    socketio.emit(event, {"run_id": run_id, **payload})

def execute_node(socketio, run_id, node):
    node_id = node['id']
    label = node['data']['label']
    emit(socketio, run_id, 'node_status', {"node_id": node_id, "status": "running", "label": label})
    # Simple rule: pick tool by label keywords (replace with structured node.type later)
    try:
        if 'kb' in label.lower() or 'collect' in label.lower():
            res = search_kb(label)  # returns dict/str
        elif 'news' in label.lower():
            res = fetch_news(label)
        elif 'llm' in label.lower() or 'reason' in label.lower():
            res = call_llm(label)
        elif 'diagnostic' in label.lower() or 'hardware' in label.lower():
            # simulate long-running hardware diag
            time.sleep(3)
            res = {"result": "diag done", "ok": True}
        else:
            # fallback: call LLM to interpret
            res = call_llm(f"Perform step: {label}")
        time.sleep(1)  # small delay to simulate processing
        emit(socketio, run_id, 'node_status', {"node_id": node_id, "status": "done", "label": label, "output": res})
        return {"node_id": node_id, "status": "done", "output": res}
    except Exception as e:
        emit(socketio, run_id, 'node_status', {"node_id": node_id, "status": "error", "label": label, "error": str(e)})
        return {"node_id": node_id, "status": "error", "error": str(e)}

def execute_flow(flow, run_id, user_id, socketio):
    # flow: { nodes: [], edges: [] }
    # naive sequential execution based on nodes order
    emit(socketio, run_id, 'flow_started', {"run_id": run_id, "meta": flow.get('meta')})
    results = []
    for node in flow.get('nodes', []):
        r = execute_node(socketio, run_id, node)
        results.append(r)
        if r.get('status') == 'error':
            break
    emit(socketio, run_id, 'flow_finished', {"run_id": run_id, "results": results})
    return results
