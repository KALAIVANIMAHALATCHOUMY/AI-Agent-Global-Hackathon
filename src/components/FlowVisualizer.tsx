// frontend/src/components/FlowVisualizer.tsx
import React, { useEffect, useState } from "react";
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Node,
  Edge,
} from "react-flow-renderer";
import { createSocket } from "../services/api";

export default function FlowVisualizer({ flow, runId }: any) {
  const [nodes, setNodes] = useState<Node[]>([]);
  console.log("nodes", nodes);
  const [edges, setEdges] = useState<Edge[]>([]);
  console.log("edge", edges);
  const [socket, setSocket] = useState<any>(null);
  console.log("s", socket);
  const [logs, setLogs] = useState<any[]>([]);
  console.log("logs", logs);

  useEffect(() => {
    // convert backend node format -> react-flow nodes with position
    const layouted = flow.nodes.map((n: any, idx: number) => ({
      id: n.id,
      data: { label: n.data.label, status: "idle" },
      position: { x: 200 * (idx % 3), y: 120 * Math.floor(idx / 3) },
      style: { border: "1px solid #999", padding: 10, borderRadius: 6 },
    }));
    const rEdges = flow.edges.map((e: any) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      animated: false,
    }));
    setNodes(layouted);
    setEdges(rEdges);
  }, [flow]);

  useEffect(() => {
    const s = createSocket();
    setSocket(s);

    s.on("connect", () => {
      console.log("socket connected");
      if (runId) s.emit("join", { run_id: runId });
    });

    s.on("node_status", (payload: any) => {
      // update node status
      const nid = payload.node_id;
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nid
            ? {
                ...n,
                data: {
                  ...n.data,
                  status: payload.status,
                  output: payload.output,
                },
              }
            : n
        )
      );
      setLogs((l) => [...l, payload]);
    });

    s.on("flow_finished", (payload: any) => {
      setLogs((l) => [...l, payload]);
    });

    return () => {
      s.disconnect();
    };
  }, [runId]);

  return (
    <div style={{ height: 400, border: "1px solid #ddd", marginTop: 12 }}>
      <ReactFlowProvider>
        <ReactFlow nodes={nodes as any} edges={edges as any} fitView>
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
      <div style={{ marginTop: 8 }}>
        <h4>Execution Log</h4>
        <div
          style={{
            maxHeight: 150,
            overflowY: "auto",
            background: "#fafafa",
            padding: 8,
          }}
        >
          {logs.map((l, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <strong>{l.label ?? l.run_id ?? "event"}</strong> —{" "}
              <em>{l.status ?? ""}</em>
              {l.output && (
                <pre style={{ whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(l.output)}
                </pre>
              )}
              {l.error && <div style={{ color: "red" }}>{l.error}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
