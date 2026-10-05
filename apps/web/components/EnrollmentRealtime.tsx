"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function EnrollmentRealtime() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("student-enrollment-realtime")

      // Section created / updated / deleted
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "course_sections",
        },
        () => {
          router.refresh();
        },
      )

      // Lesson created / updated / deleted
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lessons",
        },
        () => {
          router.refresh();
        },
      )

      // Student lesson progress changed
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lesson_progress",
        },
        () => {
          router.refresh();
        },
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}