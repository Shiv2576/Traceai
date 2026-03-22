import { z } from "zod";

export const StepSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(80),
  description: z.string().min(1),
  depends_on: z.array(z.number()),
  confidence: z.number().min(0).max(1),
});

export const ReasoningSchema = z.object({
  steps: z.array(StepSchema).min(1),
});

export type Step = z.infer<typeof StepSchema>;
export type ReasoningGraph = z.infer<typeof ReasoningSchema>;
