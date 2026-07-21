import type { StatusTone } from "@/types/global";

export interface StatDelta {
  direction: "up" | "down";
  /** e.g. "4 pts", "2 more". */
  magnitude: string;
  /** e.g. "vs last month". */
  comparison: string;
  tone: StatusTone;
}

export interface Stat {
  id: string;
  label: string;
  /** Secondary qualifier after the label, e.g. "retainers". */
  sublabel?: string;
  value: string;
  /** Optional unit shown after the value, e.g. "people". */
  unit?: string;
  delta: StatDelta;
}

export interface StatusTag {
  tone: StatusTone;
  label: string;
}

export interface ProjectRow {
  id: string;
  name: string;
  client: string;
  fee: number;
  spent: number;
  marginPct: number;
  left: number;
  status: StatusTag;
}

export type ActivityType = "booking" | "alert" | "margin" | "closed" | "change_order";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  detail: string;
  timestamp: string;
  tag?: StatusTag;
}

export interface CapacityRow {
  id: string;
  person: string;
  role: string;
  teams: string;
  bookedHours: number;
  utilizationPct: number;
  signal: StatusTag;
}

export interface RetainerRow {
  id: string;
  name: string;
  tag: string;
  monthly: number;
  usedPct: number;
}
