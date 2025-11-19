// // // // src/components/IssueToFlow.tsx
// // // import React, { useMemo, useState } from 'react';
// // // import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
// // // import 'reactflow/dist/style.css';

// // // type FlowNode = { id: string; label: string; action: string; tool?: string | null };
// // // type FlowEdge = { source: string; target: string; label?: string };
// // // type TroubleshootFlow = {
// // //   title: string;
// // //   nodes: FlowNode[];
// // //   edges: FlowEdge[];
// // //   steps: string[];
// // // };

// // // export default function IssueToFlow() {
// // //   const [issue, setIssue] = useState<string>('Windows laptop blue screen (BSOD) after update');
// // //   const [flow, setFlow] = useState<TroubleshootFlow | null>(null);
// // //   const [loading, setLoading] = useState(false);
// // //   const [err, setErr] = useState<string | null>(null);

// // //   const rfNodes = useMemo(() => {
// // //     if (!flow) return [];
// // //     // Simple layout: place nodes in a grid by index
// // //     const gapX = 280, gapY = 120;
// // //     return flow.nodes.map((n, idx) => {
// // //       const col = idx % 3;
// // //       const row = Math.floor(idx / 3);
// // //       return {
// // //         id: n.id,
// // //         data: { label: `${n.label}${n.tool ? ` • ${n.tool}` : ''}` },
// // //         position: { x: col * gapX, y: row * gapY },
// // //         style: {
// // //           padding: 12,
// // //           border: '1px solid #ddd',
// // //           borderRadius: 8,
// // //           background: '#fff',
// // //           fontSize: 12
// // //         }
// // //       };
// // //     });
// // //   }, [flow]);

// // //   const rfEdges = useMemo(() => {
// // //     if (!flow) return [];
// // //     return flow.edges.map((e, idx) => ({
// // //       id: `e-${idx}`,
// // //       source: e.source,
// // //       target: e.target,
// // //       label: e.label,
// // //       animated: false,
// // //       style: { stroke: '#999' }
// // //     }));
// // //   }, [flow]);

// // //   const generate = async () => {
// // //     setLoading(true);
// // //     setErr(null);
// // //     try {
// // //       const res = await fetch('http://localhost:5000/api/flow', {
// // //         method: 'POST',
// // //         headers: { 'Content-Type': 'application/json' },
// // //         body: JSON.stringify({ issue })
// // //       });
// // //       const json = await res.json();
// // //       if (!res.ok || json.error) throw new Error(json.error || 'Failed');
// // //       setFlow(json.flow);
// // //     } catch (e: any) {
// // //       setErr(e.message || 'Error generating flow');
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   return (
// // //     <div className="p-4 space-y-4">
// // //       <div className="space-y-2">
// // //         <h2 className="text-xl font-semibold">Issue to Flow</h2>
// // //         <p className="text-sm text-gray-600">
// // //           Enter an IT issue and generate a step-by-step troubleshooting flow with tools.
// // //         </p>
// // //         <textarea
// // //           className="w-full border rounded p-2"
// // //           rows={3}
// // //           value={issue}
// // //           onChange={(e) => setIssue(e.target.value)}
// // //           placeholder="Describe the issue..."
// // //         />
// // //         <div className="flex gap-2">
// // //           <button
// // //             onClick={generate}
// // //             disabled={loading || !issue.trim()}
// // //             className="px-3 py-2 rounded bg-black text-white disabled:opacity-50"
// // //           >
// // //             {loading ? 'Generating…' : 'Generate Flow'}
// // //           </button>
// // //         </div>
// // //         {err && <div className="text-red-600 text-sm">{err}</div>}
// // //       </div>

// // //       {flow && (
// // //         <div className="space-y-3">
// // //           <h3 className="text-lg font-semibold">{flow.title}</h3>
// // //           <div style={{ height: 460, border: '1px solid #eee', borderRadius: 8 }}>
// // //             <ReactFlow nodes={rfNodes} edges={rfEdges} fitView>
// // //               <MiniMap />
// // //               <Controls />
// // //               <Background />
// // //             </ReactFlow>
// // //           </div>
// // //           <div className="space-y-1">
// // //             <h4 className="font-semibold">Suggested Steps</h4>
// // //             <ol className="list-decimal pl-5 text-sm space-y-1">
// // //               {flow.steps.map((s, i) => (
// // //                 <li key={i}>{s}</li>
// // //               ))}
// // //             </ol>
// // //           </div>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }

// // // frontend/src/components/IssueFlowChat.tsx
// // import React, { useState } from "react";
// // import { api } from "../services/api";
// // import FlowVisualizer from "../components/FlowVisualizer";
// // import { v4 as uuidv4 } from "uuid";
// // import { log } from "mermaid/dist/logger.js";

// // export default function IssueFlowChat() {
// //   const [issue, setIssue] = useState("");
// //   const [flow, setFlow] = useState<any | null>(null);
// //   const [runId, setRunId] = useState<string | null>(null);

// //   const handleGenerate = async () => {
// //     const resp = await api.post("/api/generate-flow", { issue });
// //     console.log("resp",resp);
// //     setFlow(resp.data);
// //   };

// //   const handleRun = async () => {
// //     if (!flow) return;
// //     const newRun = uuidv4();
// //     setRunId(newRun);
// //     await api.post("/execute-flow", { flow, run_id: newRun });
// //     // FlowVisualizer subscribes to socket events and will animate
// //   };

// //   return (
// //     <div>
// //       <h3>AI Issue Flow</h3>
// //       <textarea
// //         value={issue}
// //         onChange={(e) => setIssue(e.target.value)}
// //         placeholder="Describe the user's issue..."
// //       />
// //       <div>
// //         <button onClick={handleGenerate}>Generate Flow</button>
// //         <button onClick={handleRun} disabled={!flow}>
// //           Run Flow
// //         </button>
// //       </div>

// //       {flow && <FlowVisualizer flow={flow} runId={runId} />}
// //     </div>
// //   );
// // }





// // kalai/kalai/project/src/components/IssueToFlow.tsx
// import React, { useEffect, useMemo, useState } from "react";
// import ReactFlow, {
//   Background,
//   Controls,
//   MiniMap,
//   Node,
//   Edge,
//   ReactFlowProvider,
// } from "reactflow";
// import "reactflow/dist/style.css";
// import axios from "axios";

// type FlowNode = { id: string; label: string; action: string; tool?: string | null };
// type FlowEdge = { source: string; target: string; label?: string };
// type TroubleshootFlow = {
//   title: string;
//   nodes: FlowNode[];
//   edges: FlowEdge[];
//   steps: string[];
// };

// export default function IssueToFlow() {
//   const [issue, setIssue] = useState<string>("Windows laptop blue screen (BSOD) after update");
//   const [flow, setFlow] = useState<TroubleshootFlow | null>(null);
//   const [rfNodes, setRfNodes] = useState<Node[]>([]);
//   const [rfEdges, setRfEdges] = useState<Edge[]>([]);
//   const [running, setRunning] = useState(false);
//   const [log, setLog] = useState<string[]>([]);

//   // Helper: convert backend flow to reactflow nodes/edges with positions
//   const convertToReactFlow = (f: TroubleshootFlow) => {
//     const nodes = f.nodes.map((n, idx) => {
//       const cols = 4;
//       const x = (idx % cols) * 260 + 40;
//       const y = Math.floor(idx / cols) * 120 + 40;

//       return {
//         id: n.id,
//         position: { x, y },
//         data: {
//           label: (
//             <div style={{ minWidth: 200 }}>
//               <div style={{ fontWeight: 600 }}>{n.label}</div>
//               <div style={{ fontSize: 12, opacity: 0.85 }}>{n.action}</div>
//             </div>
//           ),
//           raw: n,
//           status: "idle",
//         },
//         style: {
//           padding: 8,
//           borderRadius: 8,
//           border: "1px solid #888",
//           background: "#fff",
//         },
//       } as Node;
//     });

//     const edges = f.edges.map((e, i) => ({
//       id: `e-${i}`,
//       source: e.source,
//       target: e.target,
//       animated: false,
//       label: e.label || "",
//     }));

//     return { nodes, edges };
//   };

//   // Call backend to generate flow
//   const handleGenerate = async () => {
//     setFlow(null);
//     setRfNodes([]);
//     setRfEdges([]);
//     setLog([]);
//     try {
//       // POST to backend endpoint - ensure this matches your Flask route
//       const resp = await axios.post("http://127.0.0.1:5000/api/generate-flow", { issue });
//       // response body may be { flow: {...}, status: "success" }
//       const payload = resp.data;
//       const f = payload.flow ?? payload; // fallback
//       // minimal validation
//       if (!f || !f.nodes) {
//         setLog((l) => [...l, "Backend returned invalid flow"]);
//         return;
//       }
//       setFlow(f);
//       const { nodes, edges } = convertToReactFlow(f);
//       setRfNodes(nodes);
//       setRfEdges(edges);
//       setLog((l) => [...l, `Flow '${f.title ?? "Untitled"}' generated (${nodes.length} nodes)`]);
//     } catch (err: any) {
//       console.error("Generate error", err);
//       setLog((l) => [...l, "Error generating flow: " + (err?.message ?? String(err))]);
//     }
//   };

//   // Simple sequential executor to animate nodes
//   const handleRun = async () => {
//     if (!flow) return;
//     setRunning(true);
//     setLog((l) => [...l, "Execution started"]);
//     // Execute nodes in the order provided by flow.nodes
//     for (const n of flow.nodes) {
//       setLog((l) => [...l, `Running step: ${n.label}`]);
//       // update node status -> running
//       setRfNodes((nds) =>
//         nds.map((nd) => (nd.id === n.id ? { ...nd, data: { ...nd.data, status: "running" }, style: { ...nd.style, background: "#fff7e6", border: "2px solid #ffb84d" } } : nd))
//       );

//       // simulate async work: call backend tool endpoint if you have one; here we wait
//       await new Promise((res) => setTimeout(res, 900)); // simulate running

//       // on complete:
//       setRfNodes((nds) =>
//         nds.map((nd) => (nd.id === n.id ? { ...nd, data: { ...nd.data, status: "done" }, style: { ...nd.style, background: "#e8ffef", border: "2px solid #3bb273" } } : nd))
//       );
//       setLog((l) => [...l, `Completed: ${n.label}`]);
//       // small pause before next node
//       await new Promise((res) => setTimeout(res, 350));
//     }
//     setLog((l) => [...l, "Execution finished"]);
//     setRunning(false);
//   };

//   // If `flow` changes, reconvert (keeps reactflow in sync)
//   useEffect(() => {
//     if (flow) {
//       const { nodes, edges } = convertToReactFlow(flow);
//       setRfNodes(nodes);
//       setRfEdges(edges);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [flow]);

//   const executionDisabled = !flow || running;

//   return (
//     <div className="p-4">
//       <h2 className="text-lg font-bold mb-2">AI Issue Flow</h2>
//       <textarea
//         rows={3}
//         value={issue}
//         onChange={(e) => setIssue(e.target.value)}
//         className="w-full p-2 mb-2 border rounded"
//       />
//       <div className="flex gap-2 mb-4">
//         <button onClick={handleGenerate} className="px-3 py-1 bg-blue-600 text-white rounded">
//           Generate Flow
//         </button>
//         <button onClick={handleRun} className="px-3 py-1 bg-green-600 text-white rounded" disabled={executionDisabled}>
//           Run Flow
//         </button>
//       </div>

//       <div style={{ height: 420, width: "100%", border: "1px solid #ddd", borderRadius: 6 }}>
//         <ReactFlowProvider>
//           <ReactFlow nodes={rfNodes} edges={rfEdges} fitView>
//             <Background gap={16} />
//             <Controls />
//             <MiniMap />
//           </ReactFlow>
//         </ReactFlowProvider>
//       </div>

//       <div className="mt-3">
//         <h4 className="font-semibold">Execution Log</h4>
//         <div style={{ maxHeight: 200, overflowY: "auto", background: "#fafafa", padding: 8 }}>
//           {log.map((l, i) => (
//             <div key={i} style={{ fontSize: 13, marginBottom: 6 }}>
//               {l}
//             </div>
//           ))}
//         </div>
//       </div>

//       {flow && (
//         <div className="mt-3">
//           <h4 className="font-semibold">Suggested Steps</h4>
//           <ol className="list-decimal pl-5 text-sm space-y-1">
//             {flow.steps.map((s, i) => (
//               <li key={i}>{s}</li>
//             ))}
//           </ol>
//         </div>
//       )}
//     </div>
//   );
// }





// src/components/IssueToFlow.tsx
import React, { useEffect, useState } from "react";
import { ChevronLeft, RefreshCw, CheckCircle, XCircle, Clock, Terminal } from 'lucide-react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";

type FlowNode = { id: string; label: string; action: string; tool?: string | null };
type FlowEdge = { source: string; target: string; label?: string };
type TroubleshootFlow = {
  title: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  steps: string[];
};

const PALETTE = {
  bg: "#0b0b0b",
  nodeBorder: "#ff2cc2",
  nodeShadow: "0 0 16px #ff2cc2, 0 0 48px #8a00ff",
  runBorder: "2px solid #ff2cc2",
  doneBorder: "2px solid #8a00ff",
  runBg: "linear-gradient(135deg, #1a0035 60%, #ff2cc2 110%)",
  doneBg: "linear-gradient(135deg, #220033 60%, #11ffda 110%)",
  idleBg: "linear-gradient(135deg, #10001a 65%, #8a00ff 110%)",
  idleTxt: "#fdffe4",
  stepBullet: "#ff2cc2"
};

export default function IssueToFlow({ onBack }: { onBack?: () => void }) {
  const [issue, setIssue] = useState<string>("Windows laptop blue screen (BSOD) after update");
  const [flow, setFlow] = useState<TroubleshootFlow | null>(null);
  const [rfNodes, setRfNodes] = useState<Node[]>([]);
  const [rfEdges, setRfEdges] = useState<Edge[]>([]);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  // Helper: convert backend flow to reactflow nodes/edges with positions and vivid styles
  const convertToReactFlow = (f: TroubleshootFlow) => {
    const nodes = f.nodes.map((n, idx) => {
      const cols = 4;
      const x = (idx % cols) * 260 + 56;
      const y = Math.floor(idx / cols) * 140 + 64;
      let bg = PALETTE.idleBg, border = `2px solid ${PALETTE.nodeBorder}`;
      return {
        id: n.id,
        position: { x, y },
        data: {
          label: (
            <div style={{
              minWidth: 180,
              fontWeight: 700,
              color: PALETTE.idleTxt,
              textShadow: "0 0 8px #ff2cc2, 0 0 18px #8a00ff"
            }}>
              <div>
                {n.label}
                {n.tool && (
                  <span style={{
                    color: "#c20bff",
                    marginLeft: 7,
                    fontWeight: 500,
                    fontSize: 12,
                    filter: "brightness(3)",
                  }}>• {n.tool}</span>
                )}
              </div>
              <div style={{
                opacity: 0.75,
                fontSize: 13,
                marginTop: 2,
                color: "#faffee"
              }}>{n.action}</div>
            </div>
          ),
          raw: n,
          status: "idle",
        },
        style: {
          background: bg,
          border,
          borderRadius: 12,
          boxShadow: PALETTE.nodeShadow,
          padding: 12,
          transition: "box-shadow .2s, border .2s, background .2s"
        },
      } as Node;
    });
    const edges = f.edges.map((e, i) => ({
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      animated: true,
      label: e.label || "",
      style: { stroke: "#ff2cc2", strokeWidth: 2, filter: "drop-shadow(0 0 3px #ff2cc2)" }
    }));
    return { nodes, edges };
  };

  // Call backend to generate flow
  const handleGenerate = async () => {
    setFlow(null);
    setRfNodes([]);
    setRfEdges([]);
    setLog([]);
    try {
      const resp = await axios.post("http://127.0.0.1:5000/api/generate-flow", { issue });
      const payload = resp.data;
      const f = payload.flow ?? payload;
      if (!f || !f.nodes) { setLog(l => [...l, "Backend returned invalid flow"]); return; }
      setFlow(f);
      const { nodes, edges } = convertToReactFlow(f);
      setRfNodes(nodes);
      setRfEdges(edges);
      setLog((l) => [...l, `Flow '${f.title ?? "Untitled"}' generated (${nodes.length} nodes)`]);
    } catch (err: any) {
      setLog((l) => [...l, "Error generating flow: " + (err?.message ?? String(err))]);
    }
  };

  // Animate nodes for demo; style changes for run/done
  const handleRun = async () => {
    if (!flow) return;
    setRunning(true); setLog(l => [...l, "Execution started"]);
    for (const n of flow.nodes) {
      setLog((l) => [...l, `Running step: ${n.label}`]);
      setRfNodes(nds =>
        nds.map(nd =>
          nd.id === n.id
            ? {
                ...nd,
                style: { ...nd.style, background: PALETTE.runBg, border: PALETTE.runBorder, boxShadow: "0 0 16px #ff2cc2, 0 0 40px #ff2cc2" }
              }
            : nd
        )
      );
      await new Promise((res) => setTimeout(res, 900));
      setRfNodes(nds =>
        nds.map(nd =>
          nd.id === n.id
            ? {
                ...nd,
                style: { ...nd.style, background: PALETTE.doneBg, border: PALETTE.doneBorder, boxShadow: "0 0 20px #11ffda" }
              }
            : nd
        )
      );
      setLog((l) => [...l, `Completed: ${n.label}`]);
      await new Promise((res) => setTimeout(res, 350));
    }
    setLog((l) => [...l, "Execution finished"]);
    setRunning(false);
  };

  useEffect(() => {
    if (flow) {
      const { nodes, edges } = convertToReactFlow(flow);
      setRfNodes(nodes); setRfEdges(edges);
    }
  }, [flow]);

  const executionDisabled = !flow || running;

  return (
    <div style={{
      background: "radial-gradient(ellipse at 80% 10%, #7c00f5 0%, #0b0b0b 70%)",
      minHeight: "100vh",
      padding: 36,
      color: "#fff"
    }}>
      <div className="chat-header">
        <div className="header-left">
          <button className="back-button" onClick={onBack}>
            <ChevronLeft size={24} />
          </button>
          <div className="chat-header-info">
            <h2>Issues Visualizer</h2>
          </div>
        </div>
      </div>
      <div style={{
        background: "linear-gradient(90deg, #0b0b0b 60%, #ff2cc2 300%)",
        borderRadius: 14,
        boxShadow: "0 0 32px #ff2cc2, 0 0 64px #8a00ff",
        padding: 36,
        maxWidth: 920,
        margin: "0 auto"
      }}>
        <h2 style={{
          fontSize: 28,
          fontFamily: "Orbitron,Montserrat,sans-serif",
          fontWeight: 800,
          background: "linear-gradient(92deg,#ff2cc2,#8a00ff 60%,#ff2cc2 120%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 2px 30px #ff2cc2"
        }}>
          AI Issue Flow
        </h2>
        <textarea
          rows={3}
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          style={{
            width: "100%",
            background: "#150018",
            color: "#fff",
            fontWeight: 700,
            outline: "none",
            border: "2px solid #ff2cc2",
            borderRadius: 8,
            fontSize: 18,
            marginBottom: 20,
            padding: 14,
            boxShadow: "0 0 16px #8a00ff90"
          }}
        />
        <div style={{ display: "flex", gap: 20, marginBottom: 22 }}>
          <button onClick={handleGenerate} style={{
            padding: "10px 24px",
            borderRadius: 8,
            fontWeight: 800,
            fontFamily: "Orbitron,M+,sans-serif",
            background: "linear-gradient(92deg,#ff2cc2,#8a00ff)",
            color: "#fff",
            border: "none",
            fontSize: 18,
            boxShadow: "0 2px 18px #ff2cc2",
            cursor: executionDisabled ? "not-allowed" : "pointer",
            opacity: executionDisabled ? 0.7 : 1
          }}>
            Generate Flow
          </button>
          <button onClick={handleRun} disabled={executionDisabled} style={{
            padding: "10px 24px",
            borderRadius: 8,
            fontWeight: 800,
            fontFamily: "Orbitron,M+,sans-serif",
            background: "linear-gradient(92deg,#0ff 20%,#8a00ff 60%)",
            color: "#fff",
            border: "none",
            fontSize: 18,
            boxShadow: "0 2px 22px #11ffda",
            cursor: executionDisabled ? "not-allowed" : "pointer",
            opacity: executionDisabled ? 0.7 : 1
          }}>
            Run Flow
          </button>
        </div>
        <div style={{
          height: 430,
          width: "100%",
          border: "1px solid #ff2cc2",
          borderRadius: 12,
          background: "linear-gradient(105deg,#0b0b0b 77%,#ff2cc2 300%)",
          boxShadow: "0 0 36px #ff2cc290",
          marginBottom: 8
        }}>
          <ReactFlowProvider>
            <ReactFlow nodes={rfNodes} edges={rfEdges} fitView>
              <Background
                gap={18}
                size={1.5}
                color="#ff2cc2"
                variant="dots"
                style={{
                  filter: "brightness(2.4) blur(0.8px)",
                  opacity: 0.4
                }}
              />
              <Controls style={{ color: "#ff2cc2" }} />
              <MiniMap
                nodeStrokeColor={() => "#ff2cc2"}
                nodeColor={() => "#8a00ff"}
                maskColor="rgba(11,11,11,0.25)"
                style={{ filter: "brightness(1.6)" }}
              />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
        <div style={{
          color: "#fff",
          marginTop: 22,
          marginBottom: 8,
          fontWeight: 800,
          textShadow: "0 0 8px #ff2cc2"
        }}>
          Execution Log
        </div>
        <div style={{
          maxHeight: 180,
          overflowY: "auto",
          background: "#1b0021",
          padding: 10,
          color: "#fff",
          borderRadius: 8,
          fontFamily: "Consolas,monospace"
        }}>
          {log.map((l, i) => (
            <div key={i} style={{ fontSize: 15, marginBottom: 7, color: "#ff2cc2"}}>
              {l}
            </div>
          ))}
        </div>
        {flow && (
          <div style={{marginTop: 24}}>
            <div style={{
              color: "#fff",
              fontWeight: 800,
              marginBottom: 4,
              textShadow: "0 0 8px #ff2cc2"
            }}>Suggested Steps</div>
            <ol>
              {flow.steps.map((s, i) => (
                <li key={i} style={{
                  color: "#fafffe",
                  fontWeight: 600,
                  marginBottom: 3,
                  textShadow: "0 0 5px #8a00ff"
                }}>
                  <span style={{
                    color: PALETTE.stepBullet,
                    marginRight: 7
                  }}>◆</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

