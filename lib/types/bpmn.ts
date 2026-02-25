// ─────────────────────────────────────────────
// BPMN 2.0 Process Diagram Types
// Used for Signavio-style process flow rendering
// and BPMN 2.0 XML export (importable into SAP Signavio)
// ─────────────────────────────────────────────

/** BPMN 2.0 node types */
export type BpmnNodeType =
  | "startEvent"        // Circle — thin border (process start)
  | "endEvent"          // Circle — thick border (process end)
  | "task"              // Rounded rectangle (generic task)
  | "userTask"          // Rounded rectangle + person icon (manual step)
  | "serviceTask"       // Rounded rectangle + gear icon (automated step)
  | "exclusiveGateway"  // Diamond with X (decision: Yes/No)
  | "parallelGateway"   // Diamond with + (parallel split/join)
  | "intermediateEvent" // Double circle (waiting/timer)
  | "timerEvent";       // Double circle with clock

/** A node in the BPMN process diagram */
export interface BpmnNode {
  id: string;                     // e.g., "node_1"
  type: BpmnNodeType;
  label: string;                  // e.g., "Create Purchase Order"
  sapTransaction?: string;        // e.g., "ME21N" or "Manage Purchase Orders (F2229)"
  laneId: string;                 // references a BpmnLane.id
}

/** A directed edge (sequence flow) between two nodes */
export interface BpmnEdge {
  id: string;                     // e.g., "edge_1"
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;                 // e.g., "Yes", "No", "Approved", "Rejected"
}

/** A swim lane representing an organizational role or department */
export interface BpmnLane {
  id: string;                     // e.g., "lane_purchasing"
  label: string;                  // e.g., "Purchasing Department"
  role?: string;                  // e.g., "Buyer"
}

/** Complete BPMN process diagram data */
export interface BpmnProcessDiagram {
  title: string;                  // e.g., "Purchase Order Process"
  lanes: BpmnLane[];
  nodes: BpmnNode[];
  edges: BpmnEdge[];
}
