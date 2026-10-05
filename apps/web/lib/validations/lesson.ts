import { z } from "zod";

export const lessonSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Lesson title must be at least 2 characters.")
    .max(150, "Lesson title must be 150 characters or less."),

  description: z
    .string()
    .trim()
    .max(5000, "Description must be 5000 characters or less."),

  position: z.coerce
    .number()
    .int()
    .min(0, "Position cannot be negative."),

  durationSeconds: z.coerce
    .number()
    .int()
    .min(0, "Duration cannot be negative."),

  isPreview: z.boolean(),
});

export type LessonInput = z.infer<typeof lessonSchema>;