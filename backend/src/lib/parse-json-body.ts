import type { Response } from "express";
import type { ZodIssue, ZodType } from "zod";

/** Validate before the service layer; 400 with structured issue list on failure. */
export function parseBodyOr400<T>(
  schema: ZodType<T>,
  body: unknown,
  res: Response,
): T | undefined {
  const result = schema.safeParse(body);
  if (result.success) return result.data;
  const issues = summarizeIssues(result.error.issues);
  res.status(400).json({
    error: "validation_error",
    message: issues[0] ?? "Invalid request body.",
    issues,
  });
  return undefined;
}

function summarizeIssues(issueList: ZodIssue[]): string[] {
  return issueList.map((i) =>
    i.path.length ? `${i.path.join(".")}: ${i.message}` : i.message,
  );
}
