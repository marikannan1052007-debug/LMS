"use server";

import { createClient } from "@/lib/supabase/server";

export async function completeLesson(
  lessonId: string,
  courseId: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!enrollment) {
    throw new Error("You are not enrolled in this course.");
  }

  const { data: lesson } = await supabase
    .from("lessons")
    .select(`
      id,
      section:course_sections!inner (
        course_id
      )
    `)
    .eq("id", lessonId)
    .single();

  if (!lesson) {
    throw new Error("Lesson not found.");
  }

  const section = Array.isArray(lesson.section)
    ? lesson.section[0]
    : lesson.section;

  if (!section || section.course_id !== courseId) {
    throw new Error("Lesson does not belong to this course.");
  }

  const { error: progressError } = await supabase
    .from("lesson_progress")
    .upsert(
      {
        student_id: user.id,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "student_id,lesson_id",
      },
    );

  if (progressError) {
    throw new Error(progressError.message);
  }

  const { data: sections } = await supabase
    .from("course_sections")
    .select(`
      id,
      lessons (
        id
      )
    `)
    .eq("course_id", courseId);

  const lessonIds =
    sections?.flatMap((section) =>
      (section.lessons ?? []).map((lesson) => lesson.id),
    ) ?? [];

  const totalLessons = lessonIds.length;

  if (totalLessons === 0) {
    return {
      progressPercent: 0,
    };
  }

  const { data: completedLessons } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("student_id", user.id)
    .eq("completed", true)
    .in("lesson_id", lessonIds);

  const completedCount = completedLessons?.length ?? 0;

  const progressPercent = Math.round(
    (completedCount / totalLessons) * 100,
  );

  const completedAt =
    progressPercent === 100
      ? new Date().toISOString()
      : null;

  const { error: enrollmentError } = await supabase
    .from("enrollments")
    .update({
      progress_percent: progressPercent,
      completed_at: completedAt,
    })
    .eq("id", enrollment.id)
    .eq("student_id", user.id);

  if (enrollmentError) {
    throw new Error(enrollmentError.message);
  }

  return {
    progressPercent,
  };
}