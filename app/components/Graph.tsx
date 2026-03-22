"use client";

import { useEffect, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  ReactFlowProvider,
  Node,
  Edge,
  NodeProps,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  AnyNodeData,
  TableNodeData,
  FlowNodeData,
  MindmapNodeData,
  TimelineNodeData,
  ComparisonNodeData,
} from "@/lib/parser";
import { Column } from "@/lib/groq";

function ColumnRow({ col }: { col: Column }) {
  const isPK = col.constraints?.includes("PK");
  const isFK = col.constraints?.includes("FK");
  const isUnique = col.constraints?.includes("UNIQUE");
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        borderBottom: "1px solid #181825",
        background: isPK
          ? "rgba(45,226,160,0.04)"
          : isFK
            ? "rgba(124,106,247,0.04)"
            : "transparent",
      }}
    >
      <span
        style={{ width: 14, fontSize: 10, textAlign: "center", flexShrink: 0 }}
      >
        {isPK ? "🔑" : isFK ? "🔗" : isUnique ? "◆" : "·"}
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 11,
          flex: 1,
          color: isPK ? "#2de2a0" : isFK ? "#a599ff" : "#c8c8e0",
          fontWeight: isPK || isFK ? 600 : 400,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {col.name}
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 10,
          color: "#4a4a6a",
          flexShrink: 0,
        }}
      >
        {col.type}
      </span>
      <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
        {(col.constraints ?? [])
          .filter((c) => c !== "NOT NULL")
          .map((c) => (
            <span
              key={c}
              style={{
                fontSize: 8,
                fontFamily: "monospace",
                fontWeight: 700,
                padding: "1px 4px",
                borderRadius: 3,
                background:
                  c === "PK"
                    ? "rgba(45,226,160,0.15)"
                    : c === "FK"
                      ? "rgba(124,106,247,0.15)"
                      : c === "UNIQUE"
                        ? "rgba(247,168,74,0.15)"
                        : "rgba(255,255,255,0.06)",
                color:
                  c === "PK"
                    ? "#2de2a0"
                    : c === "FK"
                      ? "#a599ff"
                      : c === "UNIQUE"
                        ? "#f7a84a"
                        : "#5a5a7a",
              }}
            >
              {c}
            </span>
          ))}
      </div>
    </div>
  );
}

function TableNode({ data, selected }: NodeProps<AnyNodeData>) {
  const { table } = data as TableNodeData;
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: "#7c6af7",
          border: "2px solid #4a3a8a",
          width: 10,
          height: 10,
          top: -5,
        }}
      />
      <div
        style={{
          minWidth: 260,
          maxWidth: 300,
          borderRadius: 10,
          border: `1.5px solid ${selected ? "#7c6af7" : "#1e1e2e"}`,
          overflow: "hidden",
          boxShadow: selected
            ? "0 0 0 1px #7c6af7,0 8px 32px rgba(124,106,247,0.25)"
            : "0 4px 24px rgba(0,0,0,0.6)",
          background: "#0d0d18",
        }}
      >
        <div
          style={{
            padding: "10px 12px",
            background: selected ? "rgba(124,106,247,0.15)" : "#13131e",
            borderBottom: "1px solid #1e1e2e",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 14 }}>🗂</span>
          <span
            style={{
              color: "#e2e2f0",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "monospace",
            }}
          >
            {table.table_name}
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 9,
              color: "#4a4a6a",
              background: "#1e1e2e",
              padding: "2px 6px",
              borderRadius: 4,
              fontFamily: "monospace",
            }}
          >
            {table.columns.length} cols
          </span>
        </div>
        <div>
          {table.columns.map((col) => (
            <ColumnRow key={col.name} col={col} />
          ))}
        </div>
        <div
          style={{
            padding: "7px 12px",
            background: "#0a0a14",
            borderTop: "1px solid #181825",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 10,
              color: "#4a4a6a",
              lineHeight: 1.5,
              fontFamily: "sans-serif",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {table.description}
          </p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: "#7c6af7",
          border: "2px solid #4a3a8a",
          width: 10,
          height: 10,
          bottom: -5,
        }}
      />
    </>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  input: "#2de2a0",
  process: "#7c6af7",
  output: "#f7a84a",
  decision: "#e26d6d",
  default: "#4a4a8a",
};

function FlowNode({ data, selected }: NodeProps<AnyNodeData>) {
  const { node } = data as FlowNodeData;
  const color =
    CATEGORY_COLORS[node.category ?? "default"] ?? CATEGORY_COLORS.default;
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: color,
          border: "none",
          width: 8,
          height: 8,
          top: -4,
        }}
      />
      <div
        style={{
          width: 240,
          borderRadius: 12,
          overflow: "hidden",
          border: `1.5px solid ${selected ? color : "#1e1e2e"}`,
          background: "#0d0d18",
          boxShadow: selected
            ? `0 0 0 1px ${color},0 8px 28px rgba(0,0,0,0.5)`
            : "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            padding: "4px 10px",
            background: `${color}22`,
            borderBottom: `1px solid ${color}44`,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontFamily: "monospace",
              color,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {node.category ?? "step"}
          </span>
        </div>
        <div style={{ padding: "10px 12px" }}>
          <p
            style={{
              margin: 0,
              color: "#e2e2f0",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "sans-serif",
              marginBottom: 6,
            }}
          >
            {node.title}
          </p>
          <p
            style={{
              margin: 0,
              color: "#7a7a9a",
              fontSize: 11,
              lineHeight: 1.5,
              fontFamily: "sans-serif",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {node.description}
          </p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: color,
          border: "none",
          width: 8,
          height: 8,
          bottom: -4,
        }}
      />
    </>
  );
}

function MindmapNode({ data, selected }: NodeProps<AnyNodeData>) {
  const { node } = data as MindmapNodeData;
  const isRoot = node.level === 0;
  const isBranch = node.level === 1;
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#7c6af7", border: "none", width: 8, height: 8 }}
      />
      <div
        style={{
          padding: isRoot ? "14px 20px" : isBranch ? "10px 16px" : "7px 12px",
          borderRadius: isRoot ? 16 : 10,
          maxWidth: isRoot ? 200 : isBranch ? 180 : 160,
          textAlign: "center",
          border: `${isRoot ? 2 : 1.5}px solid ${selected ? "#7c6af7" : isRoot ? "#7c6af7" : isBranch ? "#2d2d4a" : "#1e1e2e"}`,
          background: isRoot
            ? "rgba(124,106,247,0.15)"
            : isBranch
              ? "#13131e"
              : "#0d0d14",
          boxShadow: isRoot
            ? "0 0 40px rgba(124,106,247,0.2)"
            : "0 2px 12px rgba(0,0,0,0.4)",
        }}
      >
        <p
          style={{
            margin: 0,
            color: isRoot ? "#a599ff" : isBranch ? "#e2e2f0" : "#9a9ab0",
            fontSize: isRoot ? 14 : isBranch ? 12 : 11,
            fontWeight: isRoot ? 700 : isBranch ? 600 : 400,
            fontFamily: "sans-serif",
          }}
        >
          {node.label}
        </p>
        {node.detail && !isRoot && (
          <p
            style={{
              margin: "4px 0 0",
              color: "#4a4a6a",
              fontSize: 10,
              fontFamily: "sans-serif",
              lineHeight: 1.4,
            }}
          >
            {node.detail}
          </p>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#7c6af7", border: "none", width: 8, height: 8 }}
      />
    </>
  );
}

function TimelineNode({ data, selected }: NodeProps<AnyNodeData>) {
  const { node } = data as TimelineNodeData;
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: "#7c6af7",
          border: "none",
          width: 8,
          height: 8,
          top: -4,
        }}
      />
      <div
        style={{
          width: 260,
          borderRadius: 12,
          border: `1.5px solid ${selected ? "#7c6af7" : "#1e1e2e"}`,
          background: "#0d0d18",
          overflow: "hidden",
          boxShadow: selected
            ? "0 0 0 1px #7c6af7,0 8px 28px rgba(124,106,247,0.2)"
            : "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            padding: "5px 12px",
            background: "rgba(124,106,247,0.1)",
            borderBottom: "1px solid #1e1e2e",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontFamily: "monospace",
              color: "#7c6af7",
              fontWeight: 700,
            }}
          >
            📅 {node.date_label}
          </span>
        </div>
        <div style={{ padding: "10px 12px" }}>
          <p
            style={{
              margin: 0,
              color: "#e2e2f0",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "sans-serif",
              marginBottom: 5,
            }}
          >
            {node.title}
          </p>
          <p
            style={{
              margin: 0,
              color: "#7a7a9a",
              fontSize: 11,
              lineHeight: 1.5,
              fontFamily: "sans-serif",
            }}
          >
            {node.description}
          </p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: "#7c6af7",
          border: "none",
          width: 8,
          height: 8,
          bottom: -4,
        }}
      />
    </>
  );
}

function ComparisonNode({ data, selected }: NodeProps<AnyNodeData>) {
  const d = data as ComparisonNodeData;
  const winA = d.winner === "a";
  const winB = d.winner === "b";
  return (
    <div
      style={{
        width: 640,
        borderRadius: 10,
        border: `1px solid ${selected ? "#7c6af7" : "#1e1e2e"}`,
        background: "#0d0d18",
        overflow: "hidden",
        boxShadow: "0 2px 16px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 1fr" }}>
        <div
          style={{
            padding: "10px 14px",
            borderRight: "1px solid #1e1e2e",
            background: "#0a0a12",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{ color: "#7a7a9a", fontSize: 11, fontFamily: "monospace" }}
          >
            {d.category}
          </span>
        </div>
        <div
          style={{
            padding: "10px 14px",
            borderRight: "1px solid #1e1e2e",
            background: winA ? "rgba(45,226,160,0.06)" : "transparent",
          }}
        >
          <p
            style={{
              margin: 0,
              color: winA ? "#2de2a0" : "#c8c8e0",
              fontSize: 11,
              fontFamily: "sans-serif",
              lineHeight: 1.4,
            }}
          >
            {winA && "✓ "}
            {d.option_a}
          </p>
        </div>
        <div
          style={{
            padding: "10px 14px",
            background: winB ? "rgba(45,226,160,0.06)" : "transparent",
          }}
        >
          <p
            style={{
              margin: 0,
              color: winB ? "#2de2a0" : "#c8c8e0",
              fontSize: 11,
              fontFamily: "sans-serif",
              lineHeight: 1.4,
            }}
          >
            {winB && "✓ "}
            {d.option_b}
          </p>
        </div>
      </div>
    </div>
  );
}

const NODE_TYPES = {
  tableNode: TableNode,
  flowNode: FlowNode,
  mindmapNode: MindmapNode,
  timelineNode: TimelineNode,
  comparisonNode: ComparisonNode,
};

interface GraphProps {
  nodes: Node<AnyNodeData>[];
  edges: Edge[];
  onNodeClick: (data: AnyNodeData) => void;
}

function FlowCanvas({
  nodes: initNodes,
  edges: initEdges,
  onNodeClick,
}: GraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
  useEffect(() => {
    setNodes(initNodes);
  }, [initNodes, setNodes]);
  useEffect(() => {
    setEdges(initEdges);
  }, [initEdges, setEdges]);

  return (
    <>
      <style>{`
        @keyframes dashmove { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }
        .react-flow__edge-path {
          stroke-dasharray: 6 3 !important;
          animation: dashmove 1.2s linear infinite !important;
        }
      `}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => onNodeClick(node.data)}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.1}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#111120" gap={32} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={() => "#13131e"}
          maskColor="rgba(5,5,8,0.85)"
          style={{
            background: "#0d0d14",
            border: "1px solid #1e1e2e",
            borderRadius: 10,
          }}
        />
      </ReactFlow>
    </>
  );
}

export default function Graph(props: GraphProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (wrapperRef.current) {
        const { width, height } = wrapperRef.current.getBoundingClientRect();
        if (width > 0 && height > 0) setReady(true);
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <ReactFlowProvider>
      <div
        ref={wrapperRef}
        style={{ width: "100%", height: "100%", background: "#05050c" }}
      >
        {ready && <FlowCanvas {...props} />}
      </div>
    </ReactFlowProvider>
  );
}
