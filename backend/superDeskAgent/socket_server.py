from flask_socketio import SocketIO, emit, join_room
from mainflask import app  # make sure app is imported from your Flask file

socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on("connect")
def on_connect():
    print("Client connected")
    emit("connected", {"message": "Socket connected"})

@socketio.on("join")
def on_join(data):
    room = data.get("run_id")
    join_room(room)
    print(f"Client joined room {room}")

@socketio.on("execute_node")
def execute_node(data):
    node_id = data.get("node_id")
    # simulate node execution
    emit("node_status", {"node_id": node_id, "status": "running"}, broadcast=True)
    emit("node_status", {"node_id": node_id, "status": "completed"}, broadcast=True)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=False)
