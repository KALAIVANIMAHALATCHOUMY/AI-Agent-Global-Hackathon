# backend/flow_templates.py
import uuid
from typing import Dict, Any

def node(id, label, type='task'):
    return {"id": id, "data": {"label": label, "type": type}, "position": {"x": 0, "y": 0}}

def edge(source, target):
    return {"id": f"e-{source}-{target}", "source": source, "target": target}

def generate_flow_from_issue(issue: str, user_id: str = 'anon') -> Dict[str, Any]:
    issue_l = issue.lower()
    # Example: create specific flows based on keywords
    if 'blue screen' in issue_l or 'bsod' in issue_l:
        n1 = str(uuid.uuid4())
        n2 = str(uuid.uuid4())
        n3 = str(uuid.uuid4())
        n4 = str(uuid.uuid4())
        nodes = [
            node(n1, "Collect basics: model, OS, error code"),
            node(n2, "Check boot behavior / BIOS / Safe Mode"),
            node(n3, "Run hardware diagnostics (RAM / Disk)"),
            node(n4, "Backup data & OS Repair / Reinstall")
        ]
        edges = [edge(n1, n2), edge(n2, n3), edge(n3, n4)]
        return {"nodes": nodes, "edges": edges, "meta": {"issue": issue, "type": "bsod"}}
    elif 'wifi' in issue_l:
        # simple wifi flow
        n1 = str(uuid.uuid4()); n2 = str(uuid.uuid4()); n3 = str(uuid.uuid4())
        nodes = [node(n1, "Check Airplane Mode & Wi-Fi toggle"), node(n2, "Restart router & reconnect"), node(n3, "Reset network settings / ISP")]
        edges = [edge(n1, n2), edge(n2, n3)]
        return {"nodes": nodes, "edges": edges, "meta": {"issue": issue, "type": "network"}}
    else:
        # generic flow
        n1 = str(uuid.uuid4()); n2 = str(uuid.uuid4()); n3 = str(uuid.uuid4())
        nodes = [node(n1, "Collect details & logs"), node(n2, "KB / News / Web search"), node(n3, "LLM reasoning -> Suggest remedial steps")]
        edges = [edge(n1, n2), edge(n2, n3)]
        return {"nodes": nodes, "edges": edges, "meta": {"issue": issue, "type": "generic"}}
