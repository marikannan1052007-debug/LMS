"use client";

import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/supabase/client";

export type Lesson = {
  id: string;
  section_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_seconds: number;
  position: number;
  is_preview: boolean;
};

export type CourseSection = {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
};

export function useCourseContent(courseId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["course-content", courseId],

    queryFn: async (): Promise<CourseSection[]> => {
      // --------------------------------------------
      // GET COURSE SECTIONS
      // --------------------------------------------

      const {
        data: sections,
        error: sectionsError,
      } = await supabase
        .from("course_sections")
        .select(
          "id, title, position",
        )
        .eq("course_id", courseId)
        .order("position", {
          ascending: true,
        });

      if (sectionsError) {
        throw new Error(
          sectionsError.message,
        );
      }

      // --------------------------------------------
      // GET LESSONS FOR EACH SECTION
      // --------------------------------------------

      const sectionsWithLessons =
        await Promise.all(
          (sections ?? []).map(
            async (section) => {
              const {
                data: lessons,
                error: lessonsError,
              } = await supabase
                .from("lessons")
                .select(`
                  id,
                  section_id,
                  title,
                  description,
                  video_url,
                  duration_seconds,
                  position,
                  is_preview
                `)
                .eq(
                  "section_id",
                  section.id,
                )
                .order("position", {
                  ascending: true,
                });

              if (lessonsError) {
                throw new Error(
                  lessonsError.message,
                );
              }

              return {
                ...section,
                lessons: lessons ?? [],
              };
            },
          ),
        );

      return sectionsWithLessons;
    },

    enabled: Boolean(courseId),
  });
}