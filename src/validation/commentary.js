import { z } from "zod";

export const listCommentaryQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const createCommentarySchema = z.object({
  minute: z.coerce.number().int().nonnegative(),
  sequence: z.coerce.number().int().nonnegative(),
  period: z.string().trim().min(1, "Period is required"),
  eventType: z.string().trim().min(1, "Event type is required"),
  actor: z.string().trim().min(1, "Actor is required"),
  team: z.string().trim().min(1, "Team is required"),
  message: z.string().trim().min(1, "Message is required"),
  metadata: z.record(z.unknown()),
  tags: z.array(z.string()),
});