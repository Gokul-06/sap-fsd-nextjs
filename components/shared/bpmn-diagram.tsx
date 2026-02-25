"use client";

import { useMemo, useCallback } from "react";
import { Download } from "lucide-react";
import type { BpmnProcessDiagram, BpmnNodeType } from "@/lib/types/bpmn";
import { convertToBpmnXml } from "@/lib/tools/bpmn-xml-converter";

// ── Layout Constants ──────────────────────────
const LANE_LABEL_WIDTH = 140;
const NODE_H_SPACING = 200;
const LANE_HEIGHT = 130;
const POOL_HEADER_HEIGHT = 0;
const LEFT_MARGIN = 20;
const TASK_WIDTH = 150;
const TASK_HEIGHT = 56;
const EVENT_RADIUS = 18;
const GATEWAY_SIZE = 44;

// ── Colors (Brand) ────────────────────────────
const COLORS = {
  navy: "#1B2A4A",
  blue: "#0091DA",
  lightBlue: "#E8F4FD",
  green: "#10B981",
  red: "#EF4444",
  amber: "#FEF3C7",
  amberBorder: "#D97706",
  blueLight: "#DBEAFE",
  blueBorder: "#3B82F6",
  laneBg1: "#F8FAFC",
  laneBg2: "#F1F5F9",
  laneLabelBg: "#1B2A4A",
  arrow: "#64748B",
  arrowHead: "#1B2A4A",
  text: "#FFFFFF",
  darkText: "#1E293B",
  mutedText: "#64748B",
  tcodeBg: "#E8F4FD",
  tcodeText: "#0369A1",
};

// ── Helpers ───────────────────────────────────

function getNodeDimensions(type: BpmnNodeType): { width: number; height: number } {
  if (type === "startEvent" || type === "endEvent" || type === "intermediateEvent" || type === "timerEvent") {
    return { width: EVENT_RADIUS * 2, height: EVENT_RADIUS * 2 };
  }
  if (type === "exclusiveGateway" || type === "parallelGateway") {
    return { width: GATEWAY_SIZE, height: GATEWAY_SIZE };
  }
  return { width: TASK_WIDTH, height: TASK_HEIGHT };
}

interface LayoutNode {
  id: string;
  type: BpmnNodeType;
  label: string;
  sapTransaction?: string;
  laneId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
}

interface LayoutEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  points: { x: number; y: number }[];
}

interface LayoutLane {
  id: string;
  label: string;
  role?: string;
  y: number;
  height: number;
}

interface Layout {
  width: number;
  height: number;
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  lanes: LayoutLane[];
}

function computeLayout(diagram: BpmnProcessDiagram): Layout {
  const { lanes, nodes, edges } = diagram;

  // Build adjacency for topological sort
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();
  nodes.forEach((n) => {
    inDegree.set(n.id, 0);
    adjacency.set(n.id, []);
  });
  edges.forEach((e) => {
    if (adjacency.has(e.sourceNodeId)) {
      adjacency.get(e.sourceNodeId)!.push(e.targetNodeId);
    }
    inDegree.set(e.targetNodeId, (inDegree.get(e.targetNodeId) || 0) + 1);
  });

  // BFS topological sort → assign columns
  const queue: string[] = [];
  const column = new Map<string, number>();
  inDegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id);
  });

  let maxCol = 0;
  while (queue.length > 0) {
    const nextQueue: string[] = [];
    for (const nodeId of queue) {
      if (!column.has(nodeId)) {
        column.set(nodeId, maxCol);
      }
      for (const next of adjacency.get(nodeId) || []) {
        const newDeg = (inDegree.get(next) || 1) - 1;
        inDegree.set(next, newDeg);
        if (newDeg === 0) {
          // Place child at least one column after parent
          const parentCol = column.get(nodeId) || 0;
          const existingCol = column.get(next);
          const targetCol = parentCol + 1;
          if (existingCol === undefined || targetCol > existingCol) {
            column.set(next, targetCol);
          }
          nextQueue.push(next);
        }
      }
    }
    queue.length = 0;
    queue.push(...nextQueue);
    maxCol++;
  }

  // Assign any unvisited nodes
  nodes.forEach((n) => {
    if (!column.has(n.id)) column.set(n.id, maxCol++);
  });

  // Compute actual max column
  let totalCols = 0;
  column.forEach((c) => { if (c > totalCols) totalCols = c; });
  totalCols += 1;

  // Lane index map
  const laneIndex = new Map<string, number>();
  lanes.forEach((lane, idx) => laneIndex.set(lane.id, idx));

  // Track nodes per cell for stacking
  const cellOccupancy = new Map<string, number>();

  // Compute node positions
  const layoutNodes: LayoutNode[] = nodes.map((node) => {
    const c = column.get(node.id) || 0;
    const lIdx = laneIndex.get(node.laneId) ?? 0;
    const dims = getNodeDimensions(node.type);

    const cellKey = `${c}-${lIdx}`;
    const stackOffset = cellOccupancy.get(cellKey) || 0;
    cellOccupancy.set(cellKey, stackOffset + 1);

    const x = LEFT_MARGIN + LANE_LABEL_WIDTH + c * NODE_H_SPACING + (NODE_H_SPACING - dims.width) / 2;
    const y = POOL_HEADER_HEIGHT + lIdx * LANE_HEIGHT + (LANE_HEIGHT - dims.height) / 2 + stackOffset * (dims.height + 12);

    return {
      ...node,
      x,
      y,
      width: dims.width,
      height: dims.height,
      cx: x + dims.width / 2,
      cy: y + dims.height / 2,
    };
  });

  // Build node map for edge routing
  const nodeMap = new Map<string, LayoutNode>();
  layoutNodes.forEach((n) => nodeMap.set(n.id, n));

  // Compute edge paths
  const layoutEdges: LayoutEdge[] = edges.map((edge) => {
    const src = nodeMap.get(edge.sourceNodeId);
    const tgt = nodeMap.get(edge.targetNodeId);
    if (!src || !tgt) return { ...edge, points: [] };

    const points: { x: number; y: number }[] = [];

    // Source: right edge center
    const sx = src.x + src.width;
    const sy = src.cy;
    // Target: left edge center
    const tx = tgt.x;
    const ty = tgt.cy;

    if (Math.abs(sy - ty) < 8) {
      // Same row — straight horizontal
      points.push({ x: sx, y: sy });
      points.push({ x: tx, y: ty });
    } else if (tx > sx + 20) {
      // Forward cross-lane — orthogonal L/Z routing
      const midX = (sx + tx) / 2;
      points.push({ x: sx, y: sy });
      points.push({ x: midX, y: sy });
      points.push({ x: midX, y: ty });
      points.push({ x: tx, y: ty });
    } else {
      // Backward or tight — route around
      const detourX = Math.max(sx, tx) + 40;
      points.push({ x: sx, y: sy });
      points.push({ x: detourX, y: sy });
      points.push({ x: detourX, y: ty });
      points.push({ x: tx, y: ty });
    }

    return { ...edge, points };
  });

  // Compute lane layout
  const layoutLanes: LayoutLane[] = lanes.map((lane, idx) => ({
    ...lane,
    y: POOL_HEADER_HEIGHT + idx * LANE_HEIGHT,
    height: LANE_HEIGHT,
  }));

  const totalWidth = LEFT_MARGIN + LANE_LABEL_WIDTH + totalCols * NODE_H_SPACING + 40;
  const totalHeight = POOL_HEADER_HEIGHT + lanes.length * LANE_HEIGHT;

  return {
    width: totalWidth,
    height: Math.max(totalHeight, 200),
    nodes: layoutNodes,
    edges: layoutEdges,
    lanes: layoutLanes,
  };
}

// ── SVG Sub-Components ────────────────────────

function SwimLane({ lane, totalWidth, index }: { lane: LayoutLane; totalWidth: number; index: number }) {
  const bgColor = index % 2 === 0 ? COLORS.laneBg1 : COLORS.laneBg2;
  return (
    <g>
      {/* Lane background */}
      <rect
        x={LEFT_MARGIN}
        y={lane.y}
        width={totalWidth - LEFT_MARGIN}
        height={lane.height}
        fill={bgColor}
        stroke="#CBD5E1"
        strokeWidth={0.5}
      />
      {/* Lane label */}
      <rect
        x={LEFT_MARGIN}
        y={lane.y}
        width={LANE_LABEL_WIDTH}
        height={lane.height}
        fill={COLORS.laneLabelBg}
        rx={0}
      />
      <text
        x={LEFT_MARGIN + LANE_LABEL_WIDTH / 2}
        y={lane.y + lane.height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={COLORS.text}
        fontSize={11}
        fontWeight={600}
        fontFamily="Inter, sans-serif"
      >
        {/* Split long labels */}
        {lane.label.length > 16 ? (
          <>
            <tspan x={LEFT_MARGIN + LANE_LABEL_WIDTH / 2} dy="-6">
              {lane.label.substring(0, lane.label.lastIndexOf(" ", 16) || 16)}
            </tspan>
            <tspan x={LEFT_MARGIN + LANE_LABEL_WIDTH / 2} dy="14">
              {lane.label.substring(lane.label.lastIndexOf(" ", 16) || 16).trim()}
            </tspan>
          </>
        ) : (
          lane.label
        )}
      </text>
      {lane.role && (
        <text
          x={LEFT_MARGIN + LANE_LABEL_WIDTH / 2}
          y={lane.y + lane.height / 2 + 16}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#94A3B8"
          fontSize={9}
          fontFamily="Inter, sans-serif"
        >
          {lane.role}
        </text>
      )}
    </g>
  );
}

function BpmnNodeShape({ node }: { node: LayoutNode }) {
  const { type, x, y, width, height, cx, cy, label, sapTransaction } = node;

  // Start Event
  if (type === "startEvent") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={EVENT_RADIUS} fill="#ECFDF5" stroke={COLORS.green} strokeWidth={2.5} />
        {/* Play icon */}
        <polygon
          points={`${cx - 5},${cy - 7} ${cx - 5},${cy + 7} ${cx + 7},${cy}`}
          fill={COLORS.green}
        />
      </g>
    );
  }

  // End Event
  if (type === "endEvent") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={EVENT_RADIUS} fill="#FEF2F2" stroke={COLORS.red} strokeWidth={3.5} />
        {/* Stop square */}
        <rect x={cx - 6} y={cy - 6} width={12} height={12} fill={COLORS.red} rx={1} />
      </g>
    );
  }

  // Intermediate/Timer Event
  if (type === "intermediateEvent" || type === "timerEvent") {
    return (
      <g>
        <circle cx={cx} cy={cy} r={EVENT_RADIUS} fill="white" stroke={COLORS.amberBorder} strokeWidth={2} />
        <circle cx={cx} cy={cy} r={EVENT_RADIUS - 4} fill="white" stroke={COLORS.amberBorder} strokeWidth={1.5} />
        {type === "timerEvent" && (
          <>
            <line x1={cx} y1={cy - 2} x2={cx} y2={cy - 8} stroke={COLORS.amberBorder} strokeWidth={1.5} />
            <line x1={cx} y1={cy - 2} x2={cx + 5} y2={cy + 2} stroke={COLORS.amberBorder} strokeWidth={1.5} />
          </>
        )}
      </g>
    );
  }

  // Exclusive Gateway
  if (type === "exclusiveGateway") {
    const half = GATEWAY_SIZE / 2;
    const points = `${cx},${cy - half} ${cx + half},${cy} ${cx},${cy + half} ${cx - half},${cy}`;
    return (
      <g>
        <polygon points={points} fill={COLORS.amber} stroke={COLORS.amberBorder} strokeWidth={2} />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={COLORS.amberBorder}
          fontSize={18}
          fontWeight={700}
          fontFamily="Inter, sans-serif"
        >
          ✕
        </text>
      </g>
    );
  }

  // Parallel Gateway
  if (type === "parallelGateway") {
    const half = GATEWAY_SIZE / 2;
    const points = `${cx},${cy - half} ${cx + half},${cy} ${cx},${cy + half} ${cx - half},${cy}`;
    return (
      <g>
        <polygon points={points} fill={COLORS.blueLight} stroke={COLORS.blueBorder} strokeWidth={2} />
        <text
          x={cx}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={COLORS.blueBorder}
          fontSize={22}
          fontWeight={700}
          fontFamily="Inter, sans-serif"
        >
          +
        </text>
      </g>
    );
  }

  // Task / UserTask / ServiceTask
  const isUser = type === "userTask";
  const isService = type === "serviceTask";
  const taskLabel = label.length > 22 ? label.substring(0, 20) + "…" : label;
  const hasTcode = !!sapTransaction;
  const totalContentHeight = hasTcode ? 36 : 18;
  const labelY = cy - totalContentHeight / 2 + 9;

  return (
    <g>
      {/* Shadow */}
      <rect
        x={x + 2}
        y={y + 2}
        width={width}
        height={height}
        rx={8}
        fill="rgba(0,0,0,0.08)"
      />
      {/* Task body */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        fill={COLORS.blue}
        stroke={COLORS.navy}
        strokeWidth={1.5}
      />
      {/* Type icon */}
      {isUser && (
        <circle cx={x + 14} cy={y + 12} r={5} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1.2} />
      )}
      {isService && (
        <circle cx={x + 14} cy={y + 12} r={5} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1.2} strokeDasharray="2,2" />
      )}
      {/* Label */}
      <text
        x={cx}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={COLORS.text}
        fontSize={11}
        fontWeight={600}
        fontFamily="Inter, sans-serif"
      >
        {taskLabel}
      </text>
      {/* SAP Transaction badge */}
      {hasTcode && (
        <g>
          <rect
            x={cx - (sapTransaction!.length * 3.5 + 8)}
            y={labelY + 10}
            width={sapTransaction!.length * 7 + 16}
            height={16}
            rx={8}
            fill="rgba(255,255,255,0.25)"
          />
          <text
            x={cx}
            y={labelY + 18}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.9)"
            fontSize={9}
            fontWeight={500}
            fontFamily="monospace"
          >
            {sapTransaction}
          </text>
        </g>
      )}
    </g>
  );
}

function BpmnEdgePath({ edge }: { edge: LayoutEdge }) {
  if (edge.points.length < 2) return null;

  const d = edge.points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Label position: midpoint of the edge
  const midIdx = Math.floor(edge.points.length / 2);
  const midPoint = edge.points[midIdx];
  const prevPoint = edge.points[midIdx - 1] || edge.points[0];
  const labelX = (midPoint.x + prevPoint.x) / 2;
  const labelY = (midPoint.y + prevPoint.y) / 2;

  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={COLORS.arrow}
        strokeWidth={1.5}
        markerEnd="url(#arrowhead)"
      />
      {edge.label && (
        <g>
          <rect
            x={labelX - edge.label.length * 3.2 - 4}
            y={labelY - 18}
            width={edge.label.length * 6.4 + 8}
            height={16}
            rx={4}
            fill="white"
            stroke="#E2E8F0"
            strokeWidth={0.5}
          />
          <text
            x={labelX}
            y={labelY - 10}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={COLORS.mutedText}
            fontSize={9}
            fontWeight={500}
            fontFamily="Inter, sans-serif"
          >
            {edge.label}
          </text>
        </g>
      )}
    </g>
  );
}

function BpmnLegend() {
  const items = [
    { label: "Start", shape: "startEvent" as const },
    { label: "End", shape: "endEvent" as const },
    { label: "Task", shape: "task" as const },
    { label: "Decision", shape: "exclusiveGateway" as const },
    { label: "Parallel", shape: "parallelGateway" as const },
  ];

  return (
    <div className="bpmn-legend">
      {items.map((item) => (
        <div key={item.shape} className="bpmn-legend-item">
          <svg width={20} height={20} viewBox="0 0 20 20">
            {item.shape === "startEvent" && (
              <circle cx={10} cy={10} r={7} fill="#ECFDF5" stroke={COLORS.green} strokeWidth={1.5} />
            )}
            {item.shape === "endEvent" && (
              <circle cx={10} cy={10} r={7} fill="#FEF2F2" stroke={COLORS.red} strokeWidth={2.5} />
            )}
            {item.shape === "task" && (
              <rect x={2} y={4} width={16} height={12} rx={3} fill={COLORS.blue} stroke={COLORS.navy} strokeWidth={1} />
            )}
            {item.shape === "exclusiveGateway" && (
              <polygon points="10,2 18,10 10,18 2,10" fill={COLORS.amber} stroke={COLORS.amberBorder} strokeWidth={1} />
            )}
            {item.shape === "parallelGateway" && (
              <polygon points="10,2 18,10 10,18 2,10" fill={COLORS.blueLight} stroke={COLORS.blueBorder} strokeWidth={1} />
            )}
          </svg>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────

interface BpmnDiagramProps {
  data: BpmnProcessDiagram;
}

export function BpmnDiagram({ data }: BpmnDiagramProps) {
  const layout = useMemo(() => computeLayout(data), [data]);

  const handleDownloadXml = useCallback(() => {
    const xml = convertToBpmnXml(data);
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-signavio.bpmn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data]);

  if (!data.nodes?.length || !data.lanes?.length) {
    return null;
  }

  return (
    <div className="bpmn-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-[#1B2A4A]">
            {data.title}
          </h4>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            SAP Signavio-compatible BPMN 2.0 Process Flow
          </p>
        </div>
        <button
          onClick={handleDownloadXml}
          className="bpmn-download-btn"
          title="Download BPMN 2.0 XML — Import into SAP Signavio"
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Download BPMN XML
        </button>
      </div>

      {/* SVG Diagram */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="w-full"
          style={{ minWidth: "700px", maxHeight: "500px" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Arrowhead marker */}
            <marker
              id="arrowhead"
              markerWidth={10}
              markerHeight={7}
              refX={9}
              refY={3.5}
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill={COLORS.arrowHead} />
            </marker>
          </defs>

          {/* Swim Lanes */}
          {layout.lanes.map((lane, i) => (
            <SwimLane key={lane.id} lane={lane} totalWidth={layout.width} index={i} />
          ))}

          {/* Edges (render below nodes) */}
          {layout.edges.map((edge) => (
            <BpmnEdgePath key={edge.id} edge={edge} />
          ))}

          {/* Nodes */}
          {layout.nodes.map((node) => (
            <BpmnNodeShape key={node.id} node={node} />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <BpmnLegend />
    </div>
  );
}
