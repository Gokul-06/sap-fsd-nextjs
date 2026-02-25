// ─────────────────────────────────────────────
// BPMN 2.0 XML Converter
// Converts BpmnProcessDiagram JSON → valid BPMN 2.0 XML
// Compatible with SAP Signavio Import (Import BPMN 2.0 XML)
// ─────────────────────────────────────────────

import type { BpmnProcessDiagram, BpmnNode, BpmnEdge, BpmnNodeType } from "@/lib/types/bpmn";

// ── Layout Constants ──────────────────────────
const LANE_LABEL_WIDTH = 30;      // Signavio-style thin label area
const LANE_HEIGHT = 125;          // Height per swim lane
const NODE_H_SPACING = 180;       // Horizontal spacing between nodes
const POOL_HEADER_HEIGHT = 40;    // Pool title header
const LEFT_MARGIN = 60;           // Left margin for first column
const TASK_WIDTH = 100;
const TASK_HEIGHT = 80;
const EVENT_SIZE = 36;
const GATEWAY_SIZE = 50;

// ── BPMN XML Element Mapping ──────────────────
function bpmnElementTag(type: BpmnNodeType): string {
  switch (type) {
    case "startEvent":        return "bpmn:startEvent";
    case "endEvent":          return "bpmn:endEvent";
    case "task":              return "bpmn:task";
    case "userTask":          return "bpmn:userTask";
    case "serviceTask":       return "bpmn:serviceTask";
    case "exclusiveGateway":  return "bpmn:exclusiveGateway";
    case "parallelGateway":   return "bpmn:parallelGateway";
    case "intermediateEvent": return "bpmn:intermediateCatchEvent";
    case "timerEvent":        return "bpmn:intermediateCatchEvent";
    default:                  return "bpmn:task";
  }
}

function getNodeDimensions(type: BpmnNodeType): { width: number; height: number } {
  if (type === "startEvent" || type === "endEvent" || type === "intermediateEvent" || type === "timerEvent") {
    return { width: EVENT_SIZE, height: EVENT_SIZE };
  }
  if (type === "exclusiveGateway" || type === "parallelGateway") {
    return { width: GATEWAY_SIZE, height: GATEWAY_SIZE };
  }
  return { width: TASK_WIDTH, height: TASK_HEIGHT };
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ── Layout Computation ────────────────────────

interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

function computeLayout(diagram: BpmnProcessDiagram) {
  const { lanes, nodes, edges } = diagram;

  // Build adjacency for topological sort
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();
  nodes.forEach((n) => {
    inDegree.set(n.id, 0);
    adjacency.set(n.id, []);
  });
  edges.forEach((e) => {
    adjacency.get(e.sourceNodeId)?.push(e.targetNodeId);
    inDegree.set(e.targetNodeId, (inDegree.get(e.targetNodeId) || 0) + 1);
  });

  // BFS topological sort → assign columns
  const queue: string[] = [];
  const column = new Map<string, number>();
  inDegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id);
  });

  let col = 0;
  while (queue.length > 0) {
    const levelSize = queue.length;
    for (let i = 0; i < levelSize; i++) {
      const nodeId = queue.shift()!;
      column.set(nodeId, col);
      for (const next of adjacency.get(nodeId) || []) {
        const newDeg = (inDegree.get(next) || 1) - 1;
        inDegree.set(next, newDeg);
        if (newDeg === 0) queue.push(next);
      }
    }
    col++;
  }

  // Assign any remaining unvisited nodes
  nodes.forEach((n) => {
    if (!column.has(n.id)) column.set(n.id, col++);
  });

  // Lane index map
  const laneIndex = new Map<string, number>();
  lanes.forEach((lane, idx) => laneIndex.set(lane.id, idx));

  // Compute positions
  const positions = new Map<string, NodePosition>();
  // Track how many nodes are already placed in each (column, lane) cell for vertical offset
  const cellCount = new Map<string, number>();

  nodes.forEach((node) => {
    const c = column.get(node.id) || 0;
    const lIdx = laneIndex.get(node.laneId) || 0;
    const cellKey = `${c}-${lIdx}`;
    const offset = cellCount.get(cellKey) || 0;
    cellCount.set(cellKey, offset + 1);

    const dims = getNodeDimensions(node.type);
    const x = LEFT_MARGIN + LANE_LABEL_WIDTH + c * NODE_H_SPACING + (NODE_H_SPACING - dims.width) / 2;
    const y = POOL_HEADER_HEIGHT + lIdx * LANE_HEIGHT + (LANE_HEIGHT - dims.height) / 2 + offset * 20;

    positions.set(node.id, { x, y, ...dims });
  });

  const totalColumns = col;
  const totalWidth = LEFT_MARGIN + LANE_LABEL_WIDTH + totalColumns * NODE_H_SPACING + 60;
  const totalHeight = POOL_HEADER_HEIGHT + lanes.length * LANE_HEIGHT;

  return { positions, totalWidth, totalHeight };
}

// ── Main Converter ────────────────────────────

export function convertToBpmnXml(diagram: BpmnProcessDiagram): string {
  const { lanes, nodes, edges } = diagram;
  const { positions, totalWidth, totalHeight } = computeLayout(diagram);

  const lines: string[] = [];

  // XML declaration and root
  lines.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  lines.push(`<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"`);
  lines.push(`                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"`);
  lines.push(`                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"`);
  lines.push(`                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"`);
  lines.push(`                  id="Definitions_1"`);
  lines.push(`                  targetNamespace="http://bpmn.io/schema/bpmn"`);
  lines.push(`                  exporter="SAP FSD Generator"`);
  lines.push(`                  exporterVersion="1.0">`);

  // Collaboration (Pool)
  lines.push(`  <bpmn:collaboration id="Collaboration_1">`);
  lines.push(`    <bpmn:participant id="Participant_Pool" name="${escapeXml(diagram.title)}" processRef="Process_1" />`);
  lines.push(`  </bpmn:collaboration>`);

  // Process with lanes
  lines.push(`  <bpmn:process id="Process_1" isExecutable="false">`);

  // Lane set
  lines.push(`    <bpmn:laneSet id="LaneSet_1">`);
  lanes.forEach((lane) => {
    const laneNodes = nodes.filter((n) => n.laneId === lane.id);
    lines.push(`      <bpmn:lane id="${escapeXml(lane.id)}" name="${escapeXml(lane.label)}">`);
    laneNodes.forEach((n) => {
      lines.push(`        <bpmn:flowNodeRef>${escapeXml(n.id)}</bpmn:flowNodeRef>`);
    });
    lines.push(`      </bpmn:lane>`);
  });
  lines.push(`    </bpmn:laneSet>`);

  // Flow nodes
  nodes.forEach((node) => {
    const tag = bpmnElementTag(node.type);
    const nameStr = node.sapTransaction
      ? `${node.label} (${node.sapTransaction})`
      : node.label;

    if (node.type === "timerEvent") {
      lines.push(`    <${tag} id="${escapeXml(node.id)}" name="${escapeXml(nameStr)}">`);
      lines.push(`      <bpmn:timerEventDefinition id="TimerDef_${escapeXml(node.id)}" />`);
      lines.push(`    </${tag}>`);
    } else {
      lines.push(`    <${tag} id="${escapeXml(node.id)}" name="${escapeXml(nameStr)}" />`);
    }
  });

  // Sequence flows
  edges.forEach((edge) => {
    const nameAttr = edge.label ? ` name="${escapeXml(edge.label)}"` : "";
    lines.push(`    <bpmn:sequenceFlow id="${escapeXml(edge.id)}" sourceRef="${escapeXml(edge.sourceNodeId)}" targetRef="${escapeXml(edge.targetNodeId)}"${nameAttr} />`);
  });

  lines.push(`  </bpmn:process>`);

  // ── Diagram Information (DI) ──
  lines.push(`  <bpmndi:BPMNDiagram id="BPMNDiagram_1">`);
  lines.push(`    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_1">`);

  // Pool shape
  lines.push(`      <bpmndi:BPMNShape id="Shape_Pool" bpmnElement="Participant_Pool" isHorizontal="true">`);
  lines.push(`        <dc:Bounds x="0" y="0" width="${totalWidth}" height="${totalHeight}" />`);
  lines.push(`      </bpmndi:BPMNShape>`);

  // Lane shapes
  lanes.forEach((lane, idx) => {
    const laneY = POOL_HEADER_HEIGHT + idx * LANE_HEIGHT;
    lines.push(`      <bpmndi:BPMNShape id="Shape_${escapeXml(lane.id)}" bpmnElement="${escapeXml(lane.id)}" isHorizontal="true">`);
    lines.push(`        <dc:Bounds x="${LEFT_MARGIN}" y="${laneY}" width="${totalWidth - LEFT_MARGIN}" height="${LANE_HEIGHT}" />`);
    lines.push(`      </bpmndi:BPMNShape>`);
  });

  // Node shapes
  nodes.forEach((node) => {
    const pos = positions.get(node.id);
    if (!pos) return;
    lines.push(`      <bpmndi:BPMNShape id="Shape_${escapeXml(node.id)}" bpmnElement="${escapeXml(node.id)}">`);
    lines.push(`        <dc:Bounds x="${Math.round(pos.x)}" y="${Math.round(pos.y)}" width="${pos.width}" height="${pos.height}" />`);
    lines.push(`      </bpmndi:BPMNShape>`);
  });

  // Edge shapes (waypoints)
  edges.forEach((edge) => {
    const srcPos = positions.get(edge.sourceNodeId);
    const tgtPos = positions.get(edge.targetNodeId);
    if (!srcPos || !tgtPos) return;

    const srcCenterX = srcPos.x + srcPos.width / 2;
    const srcCenterY = srcPos.y + srcPos.height / 2;
    const tgtCenterX = tgtPos.x + tgtPos.width / 2;
    const tgtCenterY = tgtPos.y + tgtPos.height / 2;

    // Source right edge, target left edge
    const sx = srcPos.x + srcPos.width;
    const sy = srcCenterY;
    const tx = tgtPos.x;
    const ty = tgtCenterY;

    // For same-row connections: direct horizontal
    // For cross-lane: use a midpoint for orthogonal routing
    lines.push(`      <bpmndi:BPMNEdge id="Edge_${escapeXml(edge.id)}" bpmnElement="${escapeXml(edge.id)}">`);
    if (Math.abs(sy - ty) < 5) {
      // Same lane — direct horizontal
      lines.push(`        <di:waypoint x="${Math.round(sx)}" y="${Math.round(sy)}" />`);
      lines.push(`        <di:waypoint x="${Math.round(tx)}" y="${Math.round(ty)}" />`);
    } else {
      // Cross-lane — orthogonal routing
      const midX = Math.round((sx + tx) / 2);
      lines.push(`        <di:waypoint x="${Math.round(sx)}" y="${Math.round(sy)}" />`);
      lines.push(`        <di:waypoint x="${midX}" y="${Math.round(sy)}" />`);
      lines.push(`        <di:waypoint x="${midX}" y="${Math.round(ty)}" />`);
      lines.push(`        <di:waypoint x="${Math.round(tx)}" y="${Math.round(ty)}" />`);
    }
    lines.push(`      </bpmndi:BPMNEdge>`);
  });

  lines.push(`    </bpmndi:BPMNPlane>`);
  lines.push(`  </bpmndi:BPMNDiagram>`);
  lines.push(`</bpmn:definitions>`);

  return lines.join("\n");
}
