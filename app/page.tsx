"use client";

import { useState, useCallback } from "react";
import PromptInput from "./components/PromptInput";
import NodeDetails from "./components/NodeDetails";
import Graph from "./components/Graph";
import { toFlow, AnyNodeData } from "@/lib/parser";
import { AnyResponse } from "@/lib/groq";
import { Node, Edge } from "reactflow";
import { MOCK_EXAMPLES } from "@/lib/mockData";

type View = "home" | "graph";
const TOPBAR_H = 48;

const TYPE_LABELS: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  schema: { label: "Database Schema", icon: "🗂", color: "#2de2a0" },
  flow: { label: "Process Flow", icon: "⚡", color: "#7c6af7" },
  mindmap: { label: "Mind Map", icon: "🧠", color: "#a599ff" },
  timeline: { label: "Timeline", icon: "📅", color: "#f7a84a" },
  comparison: { label: "Comparison", icon: "⚖️", color: "#e26d6d" },
};

const EXAMPLES = [
  { q: "Twitter database schema", hint: "schema" },
  { q: "How does photosynthesis work?", hint: "flow" },
  { q: "React vs Vue vs Angular", hint: "comparison" },
  { q: "History of the internet", hint: "timeline" },
  { q: "Machine learning concepts", hint: "mindmap" },
];

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes] = useState<Node<AnyNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selected, setSelected] = useState<AnyNodeData | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [vizType, setVizType] = useState<string>("flow");

  const handleSubmit = useCallback(async (q: string) => {
    setLoading(true);
    setWarning(null);
    setQuestion(q);
    try {
      const res = await fetch("/api/visualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Unknown error");
      const response: AnyResponse = json.data;
      const { nodes: n, edges: e } = toFlow(response);
      setNodes(n);
      setEdges(e);
      setVizType(response.type);
      setIsMock(json.mock ?? false);
      setWarning(json.warning ?? null);
      setSelected(null);
      setView("graph");
    } catch (err) {
      setWarning(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMockExample = useCallback(
    (q: string, hint: string) => {
      const mockResponse = MOCK_EXAMPLES[hint];
      if (!mockResponse) {
        handleSubmit(q);
        return;
      }
      const { nodes: n, edges: e } = toFlow(mockResponse);
      setNodes(n);
      setEdges(e);
      setVizType(mockResponse.type);
      setQuestion(q);
      setIsMock(true);
      setWarning(null);
      setSelected(null);
      setView("graph");
    },
    [handleSubmit],
  );

  if (view === "graph") {
    const meta = TYPE_LABELS[vizType] ?? TYPE_LABELS.flow;
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          background: "#05050c",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: TOPBAR_H,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            borderBottom: "1px solid #1a1a28",
            background: "rgba(10,10,20,0.97)",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => {
                setView("home");
                setSelected(null);
              }}
              style={{
                color: "#4a4a6a",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "monospace",
                fontSize: 12,
                padding: 0,
              }}
            >
              ← back
            </button>
            <div style={{ width: 1, height: 16, background: "#1e1e2e" }} />
            <span
              style={{
                color: "#7a7a9a",
                fontSize: 13,
                maxWidth: 400,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              &ldquo;{question}&rdquo;
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: 6,
                fontSize: 11,
                fontFamily: "monospace",
                background: `${meta.color}18`,
                border: `1px solid ${meta.color}40`,
                color: meta.color,
              }}
            >
              {meta.icon} {meta.label}
            </span>
            {isMock && (
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontFamily: "monospace",
                  background: "rgba(247,168,74,0.1)",
                  border: "1px solid rgba(247,168,74,0.2)",
                  color: "#f7a84a",
                }}
              >
                demo
              </span>
            )}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            top: TOPBAR_H,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <Graph nodes={nodes} edges={edges} onNodeClick={setSelected} />
          <NodeDetails node={selected} onClose={() => setSelected(null)} />
          {!selected && (
            <div
              style={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                padding: "6px 16px",
                borderRadius: 999,
                pointerEvents: "none",
                background: "rgba(10,10,20,0.9)",
                border: "1px solid #1a1a28",
                color: "#3a3a5a",
                fontSize: 11,
                fontFamily: "monospace",
                whiteSpace: "nowrap",
                zIndex: 5,
              }}
            >
              click any node to inspect · drag to rearrange
            </div>
          )}
          {warning && (
            <div
              style={{
                position: "absolute",
                top: 12,
                left: "50%",
                transform: "translateX(-50%)",
                padding: "6px 14px",
                borderRadius: 8,
                background: "rgba(247,168,74,0.1)",
                border: "1px solid rgba(247,168,74,0.25)",
                color: "#f7a84a",
                fontSize: 11,
                fontFamily: "monospace",
                whiteSpace: "nowrap",
                zIndex: 5,
              }}
            >
              ⚠ {warning}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-void flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
        <div className="relative mb-10 text-center">
          <div className="flex items-center gap-3 justify-center mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="3" r="2" fill="#a599ff" />
                <circle cx="3" cy="12" r="2" fill="#7c6af7" />
                <circle cx="13" cy="12" r="2" fill="#7c6af7" />
                <line
                  x1="8"
                  y1="5"
                  x2="3"
                  y2="10"
                  stroke="#7c6af7"
                  strokeWidth="1.5"
                />
                <line
                  x1="8"
                  y1="5"
                  x2="13"
                  y2="10"
                  stroke="#7c6af7"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <span className="font-display font-bold text-xl text-text tracking-tight">
              Thinking Visualizer
            </span>
          </div>
          <p className="text-text-dim font-body text-sm max-w-md mx-auto leading-relaxed">
            Ask anything — get a visual. Schemas, flows, timelines, mind maps,
            comparisons.
          </p>
          <div className="flex gap-2 justify-center mt-4 flex-wrap">
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <span
                key={k}
                style={{
                  padding: "3px 10px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontFamily: "monospace",
                  background: `${v.color}15`,
                  border: `1px solid ${v.color}35`,
                  color: v.color,
                }}
              >
                {v.icon} {v.label}
              </span>
            ))}
          </div>
        </div>
        <div className="w-full max-w-2xl relative z-10">
          <PromptInput onSubmit={handleSubmit} loading={loading} />
        </div>
        {warning && (
          <div className="mt-4 px-4 py-2.5 rounded-lg bg-warn/10 border border-warn/20 text-warn text-xs font-mono max-w-xl text-center">
            {warning}
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-2xl">
          {EXAMPLES.map(({ q, hint }) => {
            const meta = TYPE_LABELS[hint];
            return (
              <button
                key={q}
                onClick={() => handleMockExample(q)}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-panel border border-border text-text-dim font-body text-xs hover:border-accent/40 hover:text-text transition-all duration-150 disabled:opacity-30"
                style={{ display: "flex", alignItems: "center", gap: 5 }}
              >
                <span>{meta.icon}</span>
                {q}
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
