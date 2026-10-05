"use server";

import { createClient } from "@/lib/supabase/server";

const VIDEO_BUCKET = "course-videos";

export async function getLessonVideoUrl(
  lessonId: string,
  courseId: string,
) {
  const supabase = await createClient();

  /* ---------------------------------------------------------------------- */
  /* AUTHENTICATION                                                         */
  /* ---------------------------------------------------------------------- */

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in.");
  }

  /* ---------------------------------------------------------------------- */
  /* ROLE CHECK                                                             */
  /* ---------------------------------------------------------------------- */

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Unable to load your profile.");
  }

  if (profile.role !== "student") {
    throw new Error(
      "Only students can watch lessons.",
    );
  }

  /* ---------------------------------------------------------------------- */
  /* ENROLLMENT CHECK                                                       */
  /* ---------------------------------------------------------------------- */

  const {
    data: enrollment,
    error: enrollmentError,
  } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (enrollmentError) {
    console.error(
      "Enrollment lookup failed:",
      enrollmentError,
    );

    throw new Error(
      "Unable to verify course enrollment.",
    );
  }

  if (!enrollment) {
    throw new Error(
      "You are not enrolled in this course.",
    );
  }

  /* ---------------------------------------------------------------------- */
  /* LESSON                                                                  */
  /* ---------------------------------------------------------------------- */

  const {
    data: lesson,
    error: lessonError,
  } = await supabase
    .from("lessons")
    .select(
      `
        id,
        video_url,
        section_id
      `,
    )
    .eq("id", lessonId)
    .single();

  if (lessonError) {
    console.error(
      "Lesson lookup failed:",
      lessonError,
    );

    throw new Error(
      `Unable to load lesson: ${lessonError.message}`,
    );
  }

  if (!lesson) {
    throw new Error("Lesson not found.");
  }

  /* ---------------------------------------------------------------------- */
  /* SECTION                                                                 */
  /* ---------------------------------------------------------------------- */

  const {
    data: section,
    error: sectionError,
  } = await supabase
    .from("course_sections")
    .select("id, course_id")
    .eq("id", lesson.section_id)
    .single();

  if (sectionError) {
    console.error(
      "Section lookup failed:",
      sectionError,
    );

    throw new Error(
      `Unable to load section: ${sectionError.message}`,
    );
  }

  if (!section) {
    throw new Error("Section not found.");
  }

  /* ---------------------------------------------------------------------- */
  /* COURSE OWNERSHIP                                                        */
  /* ---------------------------------------------------------------------- */

  if (section.course_id !== courseId) {
    throw new Error(
      "Lesson does not belong to this course.",
    );
  }

  /* ---------------------------------------------------------------------- */
  /* VIDEO PATH                                                              */
  /* ---------------------------------------------------------------------- */

  if (!lesson.video_url) {
    throw new Error(
      "This lesson does not have a video.",
    );
  }

  const videoPath =
    lesson.video_url.trim();

  if (!videoPath) {
    throw new Error(
      "This lesson does not have a valid video path.",
    );
  }

  console.log(
    "Creating signed URL for:",
    {
      bucket: VIDEO_BUCKET,
      path: videoPath,
      lessonId,
      courseId,
      studentId: user.id,
    },
  );

  /* ---------------------------------------------------------------------- */
  /* SIGNED URL                                                              */
  /* ---------------------------------------------------------------------- */

  const {
    data: signedUrlData,
    error: signedUrlError,
  } = await supabase.storage
    .from(VIDEO_BUCKET)
    .createSignedUrl(
      videoPath,
      60 * 60,
    );

  if (signedUrlError) {
    console.error(
      "Signed URL creation failed:",
      signedUrlError,
    );

    throw new Error(
      `Unable to create video URL: ${signedUrlError.message}`,
    );
  }

  if (!signedUrlData?.signedUrl) {
    throw new Error(
      "Unable to create video URL.",
    );
  }

  return {
    signedUrl:
      signedUrlData.signedUrl,
  };
}