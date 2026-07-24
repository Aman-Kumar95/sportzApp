import { Router } from "express";
import { commentary } from "../db/schema.js";
import { db } from "../db/db.js";
import { matchIdParamSchema } from "../validation/matches.js";
import {
  createCommentarySchema,
  listCommentaryQuerySchema,
} from "../validation/commentary.js";
import { desc, eq } from "drizzle-orm";

const MAX_LIMIT = 100;

export const commentaryRouter = Router({ mergeParams: true });

commentaryRouter.get("/", async (req, res) => {
  const paramsResult = matchIdParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    return res.status(400).json({
      error: "Invalid params",
      details: JSON.stringify(paramsResult.error),
    });
  }

  const queryResult = listCommentaryQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    return res.status(400).json({
      error: "Invalid query",
      details: JSON.stringify(queryResult.error),
    });
  }

  const limit = Math.min(queryResult.data.limit ?? MAX_LIMIT, MAX_LIMIT);

  try {
    const data = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, paramsResult.data.id))
      .orderBy(desc(commentary.createdAt))
      .limit(limit);

    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to list commentary" });
  }
});

commentaryRouter.post("/", async (req, res) => {
  const paramsResult = matchIdParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    return res.status(400).json({
      error: "Invalid params",
      details: JSON.stringify(paramsResult.error),
    });
  }

  const bodyResult = createCommentarySchema.safeParse(req.body);
  if (!bodyResult.success) {
    return res.status(400).json({
      error: "Invalid payload",
      details: JSON.stringify(bodyResult.error),
    });
  }

  try {
    const { minute, ...rest } = bodyResult.data;
    const [createdCommentary] = await db
      .insert(commentary)
      .values({
        matchId: paramsResult.data.id,
        minute,
        ...rest,
      })
      .returning();

      if(res.app.locals.broadcastCommentary){
        res.app.locals.broadcastCommentary(createdCommentary.matchId,createdCommentary);
      }

    res.status(201).json({ data: createdCommentary });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to create commentary",
      details: JSON.stringify(error),
    });
  }
});