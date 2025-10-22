# from flask import Flask, request, jsonify
# from dotenv import load_dotenv
# import os
# import json
# from agent import create_agent, messages
# from flask_cors import CORS

# app = Flask(__name__)

# # ✅ Allow all origins (for development)
# # CORS(app, resources={r"/api/*": {"origins": "*"}})
# CORS(app) 

# @app.route('/api/chat', methods=['POST', 'GET'])
# def ask():
#     """
#     Flask API endpoint to handle user queries and return agent responses.

#     Expects a JSON payload with a 'query' field.
#     Returns a JSON response with the agent's reply and message history.
#     """
#     try:
#         data = request.get_json()
#         if not data or 'query' not in data:
#             return jsonify({"error": "Missing 'query' field in request"}), 400

#         # query = data['query']
#         query = data.get('query', '')
#         model = data.get('model', 'gemini-2.5-flash')  # Default model if not provided
#         print("Model selected:", model)
#         result = create_agent(query)
#         print("Agent response:", result)
#         print("response", result['response'], type(result['response']))

#         return jsonify({
#             "status": "success",
#             "response": result['response'],
#             "message_history": result["message_history"]
#         })

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# # mainflask.py
# from agent import create_agent, messages, generate_troubleshooting_flow

# @app.route('/api/flow', methods=['POST'])
# def flow():
#     try:
#         data = request.get_json() or {}
#         issue = data.get('issue') or data.get('query') or ''
#         if not issue:
#             return jsonify({"error": "Missing 'issue'"}), 400
#         flow = generate_troubleshooting_flow(issue)
#         return jsonify({"status": "success", "flow": flow})
#     except Exception as e:
#         return jsonify({"error": str(e)}),500

# if __name__ == '__main__':
#     # Run Flask app
#     app.run(debug=True, host='0.0.0.0', port=5000)


from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv
import os
import json
from agent import create_agent, messages, generate_troubleshooting_flow
from flask_cors import CORS

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

# -------------------------------
# ✅ Chat route (already in your code)
# -------------------------------
@app.route('/api/chat', methods=['POST', 'GET'])
def ask():
    try:
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({"error": "Missing 'query' field in request"}), 400

        query = data.get('query', '')
        model = data.get('model', 'gemini-2.5-flash')
        print("Model selected:", model)

        result = create_agent(query)
        print("Agent response:", result)

        return jsonify({
            "status": "success",
            "response": result['response'],
            "message_history": result["message_history"]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------------
# ✅ Troubleshooting Flow route (already in your code)
# -------------------------------
# @app.route('/api/generate-flow', methods=['POST'])
# def flow():
#     try:
#         data = request.get_json() or {}
#         issue = data.get('issue') or data.get('query') or ''
#         print("i",issue);
#         if not issue:
#             return jsonify({"error": "Missing 'issue'"}), 400

#         flow = generate_troubleshooting_flow(issue)
#         print("f",flow);
#         return jsonify({"status": "success", "flow": flow})
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

@app.route('/api/generate-flow', methods=['POST'])
def flow():
    try:
        data = request.get_json() or {}
        issue = data.get('issue') or data.get('query') or ''
        print("i", issue)
        if not issue:
            return jsonify({"error": "Missing 'issue'"}), 400

        flow = generate_troubleshooting_flow(issue)
        print("f", flow)
        
        # -- Ensure all IDs and references are strings (fix for React Flow) --
        for node in flow["nodes"]:
            node["id"] = str(node["id"])
        for edge in flow["edges"]:
            edge["source"] = str(edge["source"])
            edge["target"] = str(edge["target"])

        return jsonify({"status": "success", "flow": flow})
    except Exception as e:
        print("Backend serialization error:", e)
        return jsonify({"error": str(e)}), 500

# -------------------------------
# 🧠 New route — UI to visualize flow (from app.py)
# -------------------------------
@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
