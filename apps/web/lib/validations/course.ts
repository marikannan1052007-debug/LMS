import { z } from "zod";

export const courseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Course title must be at least 3 characters.")
    .max(150, "Course title must be 150 characters or less."),

  description: z
    .string()
    .trim()
    .max(5000, "Description must be 5000 characters or less.")
    .optional()
    .or(z.literal("")),

  category: z
    .string()
    .trim()
    .min(1, "Please select a category.")
    .max(100, "Category must be 100 characters or less."),

  level: z.enum(
    ["beginner", "intermediate", "advanced"],
    {
      message: "Please select a valid course level.",
    },
  ),

  price: z.coerce
    .number()
    .min(0, "Price cannot be negative.")
    .max(9999999.99, "Price is too large."),

  thumbnail: z
    .any()
    .optional(),
});

export type CourseInput = z.infer<typeof courseSchema>;