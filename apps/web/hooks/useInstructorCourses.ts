"use client";

import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";

export type InstructorCourse = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  level: "beginner" | "intermediate" | "advanced" | null;
  price: number;
  published: boolean;
  created_at: string;
};

export function useInstructorCourses() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["instructor-courses"],
    queryFn: async (): Promise<InstructorCourse[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in.");
      }

      const { data, error } = await supabase
        .from("courses")
        .select(
          "id, title, slug, category, level, price, published, created_at",
        )
        .eq("instructor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return (data ?? []).map((course) => ({
        ...course,
        price: Number(course.price),
      }));
    },
  });
}