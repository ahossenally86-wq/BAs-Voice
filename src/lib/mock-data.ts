export type PromptCategory =
  | "Requirements Gathering"
  | "Stakeholder Interviews"
  | "Process Mapping"
  | "Risk & Assumptions"
  | "Scope Clarification"
  | "Decision Validation";

export interface Prompt {
  id: string;
  text: string;
  category: PromptCategory;
  tags: string[];
  shortcut?: string;
  favorite?: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  time: string; // ISO
  attendees: number;
  type: string;
}

export const CATEGORIES: PromptCategory[] = [
  "Requirements Gathering",
  "Stakeholder Interviews",
  "Process Mapping",
  "Risk & Assumptions",
  "Scope Clarification",
  "Decision Validation",
];

export const PROMPTS: Prompt[] = [
  { id: "p1", text: "Can we double click on that?", category: "Requirements Gathering", tags: ["clarify", "depth"], shortcut: "dc", favorite: true },
  { id: "p2", text: "What problem are we solving here?", category: "Scope Clarification", tags: ["problem", "framing"], shortcut: "pr", favorite: true },
  { id: "p3", text: "Who owns this process today?", category: "Stakeholder Interviews", tags: ["ownership"], shortcut: "own" },
  { id: "p4", text: "What assumptions are we making?", category: "Risk & Assumptions", tags: ["assumptions"], shortcut: "as", favorite: true },
  { id: "p5", text: "What would success look like?", category: "Decision Validation", tags: ["success", "outcomes"], shortcut: "su" },
  { id: "p6", text: "Can you clarify the pain point?", category: "Requirements Gathering", tags: ["pain"], shortcut: "pa" },
  { id: "p7", text: "What happens if we don't do this?", category: "Risk & Assumptions", tags: ["risk", "impact"], shortcut: "nd" },
  { id: "p8", text: "Who else should be in the room for this decision?", category: "Decision Validation", tags: ["stakeholders"], shortcut: "wh" },
  { id: "p9", text: "Walk me through the current process step by step.", category: "Process Mapping", tags: ["process"], shortcut: "wa" },
  { id: "p10", text: "Where does this process typically break down?", category: "Process Mapping", tags: ["pain", "process"], shortcut: "br" },
  { id: "p11", text: "Is this in scope for the MVP?", category: "Scope Clarification", tags: ["mvp", "scope"], shortcut: "sc" },
  { id: "p12", text: "What dependencies do we need to consider?", category: "Risk & Assumptions", tags: ["dependencies"], shortcut: "de" },
  { id: "p13", text: "How do we measure that?", category: "Decision Validation", tags: ["metrics"], shortcut: "me" },
  { id: "p14", text: "Can we park that and come back to it?", category: "Process Mapping", tags: ["facilitation", "parking"], shortcut: "pk" },
  { id: "p15", text: "What's the smallest version of this we could ship?", category: "Scope Clarification", tags: ["mvp"], shortcut: "sm" },
  { id: "p16", text: "Whose input do we still need on this?", category: "Stakeholder Interviews", tags: ["stakeholders"], shortcut: "in" },
  { id: "p17", text: "Are we aligned on the definition?", category: "Requirements Gathering", tags: ["alignment"], shortcut: "al" },
  { id: "p18", text: "Let's capture that as an action item.", category: "Process Mapping", tags: ["action"], shortcut: "ac" },
];

export const UPCOMING_MEETINGS: Meeting[] = [
  { id: "m1", title: "Payments discovery workshop", time: new Date(Date.now() + 1000 * 60 * 60).toISOString(), attendees: 8, type: "Workshop" },
  { id: "m2", title: "Stakeholder interview — Finance Ops", time: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(), attendees: 3, type: "Interview" },
  { id: "m3", title: "Sprint scope review", time: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(), attendees: 6, type: "Review" },
];

export const RECENT_PROMPT_IDS = ["p1", "p2", "p9", "p4", "p11"];
