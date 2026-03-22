import { z } from "zod";

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";

export type QueryType =
  | "schema"
  | "flow"
  | "mindmap"
  | "timeline"
  | "comparison";

export const ColumnSchema = z.object({
  name: z.string(),
  type: z.string(),
  constraints: z.array(z.string()).nullable().default([]),
  references: z.string().nullable().optional(),
});
export const TableSchema = z.object({
  id: z.number(),
  table_name: z.string(),
  description: z.string(),
  columns: z.array(ColumnSchema),
  depends_on: z.array(z.number()),
});
export const SchemaResponseSchema = z.object({
  type: z.literal("schema"),
  tables: z.array(TableSchema).min(1),
});

export const FlowNodeSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  depends_on: z.array(z.number()),
  category: z.string().optional(),
});
export const FlowResponseSchema = z.object({
  type: z.literal("flow"),
  nodes: z.array(FlowNodeSchema).min(1),
});

export const MindmapNodeSchema = z.object({
  id: z.number(),
  label: z.string(),
  detail: z.string(),
  parent_id: z.number().nullable(),
  level: z.number(),
});
export const MindmapResponseSchema = z.object({
  type: z.literal("mindmap"),
  nodes: z.array(MindmapNodeSchema).min(1),
});

export const TimelineNodeSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  date_label: z.string(),
  depends_on: z.array(z.number()),
});
export const TimelineResponseSchema = z.object({
  type: z.literal("timeline"),
  nodes: z.array(TimelineNodeSchema).min(1),
});

export const ComparisonItemSchema = z.object({
  id: z.number(),
  category: z.string(),
  option_a: z.string(),
  option_b: z.string(),
  winner: z.string().nullable(),
});
export const ComparisonResponseSchema = z.object({
  type: z.literal("comparison"),
  title_a: z.string(),
  title_b: z.string(),
  items: z.array(ComparisonItemSchema).min(1),
  verdict: z.string(),
});

export type Column = z.infer<typeof ColumnSchema>;
export type Table = z.infer<typeof TableSchema>;
export type SchemaResponse = z.infer<typeof SchemaResponseSchema>;
export type FlowNode = z.infer<typeof FlowNodeSchema>;
export type FlowResponse = z.infer<typeof FlowResponseSchema>;
export type MindmapNode = z.infer<typeof MindmapNodeSchema>;
export type MindmapResponse = z.infer<typeof MindmapResponseSchema>;
export type TimelineNode = z.infer<typeof TimelineNodeSchema>;
export type TimelineResponse = z.infer<typeof TimelineResponseSchema>;
export type ComparisonResponse = z.infer<typeof ComparisonResponseSchema>;
export type AnyResponse =
  | SchemaResponse
  | FlowResponse
  | MindmapResponse
  | TimelineResponse
  | ComparisonResponse;

function detectType(question: string): QueryType {
  const q = question.toLowerCase();
  if (/\bvs\b|versus|compare|difference|better|pros.*cons/.test(q))
    return "comparison";
  if (/database|schema|table|sql|postgres|mysql|supabase|erd|relation/.test(q))
    return "schema";
  if (
    /history|timeline|evolution|when did|how did.*start|origin|over time|century|decade/.test(
      q,
    )
  )
    return "timeline";
  if (
    /how does|how do|process|photosynthesis|respiration|cycle|mechanism|step|explain|what happens/.test(
      q,
    )
  )
    return "flow";
  return "mindmap";
}

const PROMPTS: Record<QueryType, string> = {
  schema: `You are a senior database architect. Return a relational database schema as STRICT JSON only.
Return ONLY:
{
  "type": "schema",
  "tables": [
    {
      "id": 1,
      "table_name": "users",
      "description": "Stores user accounts.",
      "columns": [
        { "name": "id", "type": "UUID", "constraints": ["PK", "NOT NULL"], "references": null },
        { "name": "email", "type": "VARCHAR(255)", "constraints": ["UNIQUE", "NOT NULL"], "references": null }
      ],
      "depends_on": []
    }
  ]
}
Rules: references is always string or null never omit it, constraints is always an array never null, 5-9 tables, real SQL types.`,

  flow: `You are an expert educator. Break any process into a clear step-by-step flow graph as STRICT JSON only.
Return ONLY:
{
  "type": "flow",
  "nodes": [
    {
      "id": 1,
      "title": "Short step title",
      "description": "Detailed explanation of this step (2-3 sentences).",
      "depends_on": [],
      "category": "input"
    }
  ]
}
Rules: category is one of input/process/output/decision. 6-10 nodes. depends_on shows logical order.`,

  mindmap: `You are an expert educator. Break any topic into a hierarchical mind map as STRICT JSON only.
Return ONLY:
{
  "type": "mindmap",
  "nodes": [
    { "id": 1, "label": "Root Topic", "detail": "Brief overview.", "parent_id": null, "level": 0 },
    { "id": 2, "label": "Branch", "detail": "Description.", "parent_id": 1, "level": 1 },
    { "id": 3, "label": "Leaf detail", "detail": "Specific detail.", "parent_id": 2, "level": 2 }
  ]
}
Rules: exactly 1 root (level 0), 3-5 branches (level 1), 2-3 leaves per branch (level 2). parent_id is always a number or null.`,

  timeline: `You are a historian and educator. Break any topic into a chronological timeline as STRICT JSON only.
Return ONLY:
{
  "type": "timeline",
  "nodes": [
    {
      "id": 1,
      "title": "Event title",
      "description": "What happened and why it matters (2-3 sentences).",
      "date_label": "1969",
      "depends_on": []
    }
  ]
}
Rules: 6-10 events in chronological order. depends_on shows causal dependencies.`,

  comparison: `You are an expert analyst. Compare two things across multiple dimensions as STRICT JSON only.
Return ONLY:
{
  "type": "comparison",
  "title_a": "Option A",
  "title_b": "Option B",
  "items": [
    {
      "id": 1,
      "category": "Performance",
      "option_a": "Description for A",
      "option_b": "Description for B",
      "winner": "a"
    }
  ],
  "verdict": "Overall recommendation in 2 sentences."
}
Rules: 6-8 comparison categories. winner is "a", "b", or null for tie.`,
};

function sanitize(data: unknown): unknown {
  if (Array.isArray(data)) return data.map(sanitize);
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      if (key === "references") {
        out[key] = typeof obj[key] === "string" ? obj[key] : null;
      } else if (key === "constraints" || key === "depends_on") {
        out[key] = Array.isArray(obj[key]) ? obj[key].map(sanitize) : [];
      } else if (key === "winner") {
        out[key] = typeof obj[key] === "string" ? obj[key] : null;
      } else if (key === "parent_id") {
        out[key] = typeof obj[key] === "number" ? obj[key] : null;
      } else {
        out[key] = sanitize(obj[key]);
      }
    }
    return out;
  }
  return data;
}

export async function fetchVisualization(
  question: string,
): Promise<AnyResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set in .env.local");

  const queryType = detectType(question);

  const res = await fetch(GROQ_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 6000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: PROMPTS[queryType] },
        {
          role: "user",
          content: `Topic: "${question}"\n\nReturn ONLY valid JSON for this exact topic.`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Empty response from Groq");

  const cleaned = raw.replace(/```json|```/gi, "").trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Failed to parse JSON: ${cleaned.slice(0, 200)}`);
  }

  const safe = sanitize(parsed) as Record<string, unknown>;
  safe.type = queryType;

  switch (queryType) {
    case "schema":
      return SchemaResponseSchema.parse(safe);
    case "flow":
      return FlowResponseSchema.parse(safe);
    case "mindmap":
      return MindmapResponseSchema.parse(safe);
    case "timeline":
      return TimelineResponseSchema.parse(safe);
    case "comparison":
      return ComparisonResponseSchema.parse(safe);
  }
}
