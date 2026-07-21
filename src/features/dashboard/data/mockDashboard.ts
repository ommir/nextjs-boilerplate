import type {
  ActivityItem,
  CapacityRow,
  ProjectRow,
  RetainerRow,
  Stat,
} from "../types";

/** Headline metric cards (top row of the overview). */
export const stats: Stat[] = [
  {
    id: "utilization",
    label: "Billable Utilization",
    value: "68%",
    delta: { direction: "down", magnitude: "4 pts", comparison: "vs last month", tone: "danger" },
  },
  {
    id: "margin",
    label: "Avg Project Margin",
    value: "31%",
    delta: { direction: "down", magnitude: "6 pts", comparison: "vs last month", tone: "danger" },
  },
  {
    id: "burn",
    label: "Budget Burn",
    sublabel: "retainers",
    value: "84%",
    delta: { direction: "up", magnitude: "11 pts", comparison: "vs last month", tone: "danger" },
  },
  {
    id: "overbooked",
    label: "Overbooked",
    sublabel: "next week",
    value: "3",
    unit: "people",
    delta: { direction: "up", magnitude: "2 more", comparison: "vs last week", tone: "danger" },
  },
];

/** "Projects By Client" — off-plan first, margin health flagged. */
export const projects: ProjectRow[] = [
  {
    id: "p1",
    name: "Rebrand & guidelines",
    client: "Verve Skincare",
    fee: 180_000,
    spent: 141_000,
    marginPct: 22,
    left: 39_000,
    status: { tone: "danger", label: "Over pace" },
  },
  {
    id: "p2",
    name: "Always-on social",
    client: "Verve Skincare",
    fee: 12_000,
    spent: 11_400,
    marginPct: 5,
    left: 600,
    status: { tone: "danger", label: "Scope creep" },
  },
  {
    id: "p3",
    name: "Product launch film",
    client: "Bloom Fitness",
    fee: 95_000,
    spent: 52_000,
    marginPct: 41,
    left: 43_000,
    status: { tone: "warning", label: "Watch VFX" },
  },
  {
    id: "p4",
    name: "Website redesign",
    client: "Cardinal Bank",
    fee: 140_000,
    spent: 61_000,
    marginPct: 47,
    left: 79_000,
    status: { tone: "success", label: "On track" },
  },
  {
    id: "p5",
    name: "Campaign · Q3",
    client: "Tessera Bio",
    fee: 68_000,
    spent: 24_000,
    marginPct: 52,
    left: 44_000,
    status: { tone: "success", label: "On track" },
  },
];

/** "Recent Activity" — bookings, budgets, margins, and syncs. */
export const activity: ActivityItem[] = [
  {
    id: "a1",
    type: "booking",
    title: "Booking Added",
    detail: "Dana Cole → Verve Social, 12h next week",
    timestamp: "Now · 10:48",
    tag: { tone: "danger", label: "Now 124%" },
  },
  {
    id: "a2",
    type: "alert",
    title: "Budget Alert",
    detail: "Verve retainer crossed 95% used",
    timestamp: "Today · 09:30",
  },
  {
    id: "a3",
    type: "margin",
    title: "Margin Updated",
    detail: "Acme rebrand fell to 22% after weekly time sync",
    timestamp: "Yesterday · 17:20",
  },
  {
    id: "a4",
    type: "closed",
    title: "Project Closed",
    detail: "Tessera brand sprint delivered at 54% margin",
    timestamp: "Yesterday · 16:04",
  },
  {
    id: "a5",
    type: "change_order",
    title: "Change Order Signed",
    detail: "Cardinal +$14K scope added",
    timestamp: "Jun 24",
  },
];

/** "Team Capacity · Next Week" — overbooked first. */
export const capacity: CapacityRow[] = [
  {
    id: "c1",
    person: "Dana Cole",
    role: "Sr Designer",
    teams: "Acme, Verve",
    bookedHours: 49.5,
    utilizationPct: 124,
    signal: { tone: "danger", label: "Double-booked" },
  },
  {
    id: "c2",
    person: "Marco Diaz",
    role: "Copywriter",
    teams: "Acme",
    bookedHours: 47,
    utilizationPct: 118,
    signal: { tone: "warning", label: "Over" },
  },
  {
    id: "c3",
    person: "Priya Shah",
    role: "Strategist",
    teams: "Bloom",
    bookedHours: 36,
    utilizationPct: 90,
    signal: { tone: "warning", label: "Watch" },
  },
  {
    id: "c4",
    person: "Tess Ito",
    role: "Designer",
    teams: "Verve",
    bookedHours: 28,
    utilizationPct: 71,
    signal: { tone: "success", label: "Healthy" },
  },
];

/** "Retainer Burn" — used vs month elapsed (70% through June). */
export const retainers: RetainerRow[] = [
  { id: "r1", name: "Verve", tag: "always-on social", monthly: 12_000, usedPct: 95 },
  { id: "r2", name: "Cardinal", tag: "support + optimization", monthly: 18_000, usedPct: 62 },
  { id: "r3", name: "Bloom", tag: "content retainer", monthly: 8_000, usedPct: 88 },
];
