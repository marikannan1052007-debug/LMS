import { createClient } from "@/lib/supabase/server";

export async function getNextLessonForCourse(
  courseId: string,
  studentId: string,
) {
  const supabase = await createClient();

  const { data: sections, error } = await supabase
    .from("course_sections")
    .select(`
      id,
      position,
      lessons (
        id,
        title,
        position
      )
    `)
    .eq("course_id", courseId)
    .order("position", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  const lessons = (sections ?? [])
    .flatMap((section) =>
      (section.lessons ?? []).map((lesson) => ({
        ...lesson,
        sectionPosition: section.position,
      })),
    )
    .sort((a, b) => {
      if (a.sectionPosition !== b.sectionPosition) {
        return a.sectionPosition - b.sectionPosition;
      }

      return a.position - b.position;
    });

  if (lessons.length === 0) {
    return null;
  }

  const { data: completedProgress, error: progressError } =
    await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("student_id", studentId)
      .eq("completed", true)
      .in(
        "lesson_id",
        lessons.map((lesson) => lesson.id),
      );

  if (progressError) {
    throw new Error(progressError.message);
  }

  const completedIds = new Set(
    (completedProgress ?? []).map(
      (progress) => progress.lesson_id,
    ),
  );

  return (
    lessons.find((lesson) => !completedIds.has(lesson.id)) ??
    lessons[lessons.length - 1]
  );
}