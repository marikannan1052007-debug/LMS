"use server";

import { createClient } from "@/lib/supabase/server";
import { lessonSchema } from "@/lib/validations/lesson";

const VIDEO_BUCKET = "course-videos";

const MAX_VIDEO_SIZE = 500 * 1024 * 1024;

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

function getExtension(fileName: string) {
  const extension = fileName
    .split(".")
    .pop()
    ?.toLowerCase();

  if (!extension) {
    throw new Error(
      "Unable to determine video file extension.",
    );
  }

  return extension;
}

function validateVideo(file: File) {
  if (!file || file.size === 0) {
    throw new Error("Please select a video.");
  }

  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    throw new Error(
      "Only MP4, WebM, and MOV videos are allowed.",
    );
  }

  if (file.size > MAX_VIDEO_SIZE) {
    throw new Error(
      "Video size must be 500MB or less.",
    );
  }
}

async function requireInstructor() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    throw new Error(
      "Unable to load your profile.",
    );
  }

  if (profile.role !== "instructor") {
    throw new Error(
      "Only instructors can manage lessons.",
    );
  }

  return {
    supabase,
    user,
  };
}

/* -------------------------------------------------------------------------- */
/* VERIFY SECTION OWNERSHIP                                                   */
/* -------------------------------------------------------------------------- */

async function verifySectionOwnership(
  sectionId: string,
  courseId: string,
  instructorId: string,
) {
  const supabase = await createClient();

  if (!sectionId) {
    throw new Error(
      "Section ID is required.",
    );
  }

  if (!courseId) {
    throw new Error(
      "Course ID is required.",
    );
  }

  const {
    data: section,
    error: sectionError,
  } = await supabase
    .from("course_sections")
    .select("id, course_id")
    .eq("id", sectionId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (sectionError) {
    console.error(
      "Section lookup failed:",
      sectionError,
    );

    throw new Error(
      `Unable to find section: ${sectionError.message}`,
    );
  }

  if (!section) {
    throw new Error("Section not found.");
  }

  const {
    data: course,
    error: courseError,
  } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .eq("instructor_id", instructorId)
    .maybeSingle();

  if (courseError) {
    console.error(
      "Course ownership lookup failed:",
      courseError,
    );

    throw new Error(
      `Unable to verify course: ${courseError.message}`,
    );
  }

  if (!course) {
    throw new Error(
      "You do not own this course.",
    );
  }

  return section;
}

/* -------------------------------------------------------------------------- */
/* UPLOAD VIDEO                                                               */
/* -------------------------------------------------------------------------- */

async function uploadVideo(
  supabase: Awaited<
    ReturnType<typeof createClient>
  >,
  file: File,
  userId: string,
  courseId: string,
  lessonId: string,
) {
  validateVideo(file);

  const extension = getExtension(file.name);

  // Random filename prevents collisions
  // when replacing videos.
  const filePath = `${userId}/${courseId}/${lessonId}/${crypto.randomUUID()}.${extension}`;

  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from(VIDEO_BUCKET)
    .upload(filePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(
      `Video upload failed: ${error.message}`,
    );
  }

  return filePath;
}

/* -------------------------------------------------------------------------- */
/* DELETE VIDEO                                                               */
/* -------------------------------------------------------------------------- */

async function deleteVideo(
  supabase: Awaited<
    ReturnType<typeof createClient>
  >,
  videoPath: string | null,
) {
  if (!videoPath) {
    return;
  }

  const { error } = await supabase.storage
    .from(VIDEO_BUCKET)
    .remove([videoPath]);

  if (error) {
    console.error(
      "Failed to delete old video:",
      error.message,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* CREATE LESSON                                                              */
/* -------------------------------------------------------------------------- */

export async function createLesson(
  formData: FormData,
) {
  const { supabase, user } =
    await requireInstructor();

  const sectionId = String(
    formData.get("sectionId") ?? "",
  );

  const courseId = String(
    formData.get("courseId") ?? "",
  );

  const title = String(
    formData.get("title") ?? "",
  );

  const description = String(
    formData.get("description") ?? "",
  );

  const position = Number(
    formData.get("position") ?? 0,
  );

  const durationSeconds = Number(
    formData.get("durationSeconds") ?? 0,
  );

  const isPreview =
    formData.get("isPreview") === "true";

  const video = formData.get("video");

  if (!(video instanceof File)) {
    throw new Error(
      "Please select a video.",
    );
  }

  validateVideo(video);

  /*
   * IMPORTANT:
   *
   * verifySectionOwnership expects:
   *
   * sectionId
   * courseId
   * instructorId
   *
   * Do not pass supabase as an argument.
   */
  await verifySectionOwnership(
    sectionId,
    courseId,
    user.id,
  );

  const parsed = lessonSchema.safeParse({
    title,
    description,
    position,
    durationSeconds,
    isPreview,
  });

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ??
        "Invalid lesson data.",
    );
  }

  const {
    data: lesson,
    error: lessonError,
  } = await supabase
    .from("lessons")
    .insert({
      section_id: sectionId,
      title: parsed.data.title,
      description:
        parsed.data.description || null,
      content: null,
      video_url: null,
      duration_seconds:
        parsed.data.durationSeconds,
      position: parsed.data.position,
      is_preview: parsed.data.isPreview,
    })
    .select("id")
    .single();

  if (lessonError || !lesson) {
    throw new Error(
      lessonError?.message ??
        "Failed to create lesson.",
    );
  }

  try {
    const videoPath = await uploadVideo(
      supabase,
      video,
      user.id,
      courseId,
      lesson.id,
    );

    const {
      error: updateError,
    } = await supabase
      .from("lessons")
      .update({
        video_url: videoPath,
      })
      .eq("id", lesson.id);

    if (updateError) {
      await deleteVideo(
        supabase,
        videoPath,
      );

      await supabase
        .from("lessons")
        .delete()
        .eq("id", lesson.id);

      throw new Error(
        updateError.message,
      );
    }

    return {
      success: true,
      lessonId: lesson.id,
    };
  } catch (error) {
    /*
     * If video upload or update fails,
     * remove the lesson record so we
     * don't leave an incomplete lesson.
     */
    await supabase
      .from("lessons")
      .delete()
      .eq("id", lesson.id);

    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/* UPDATE LESSON                                                              */
/* -------------------------------------------------------------------------- */

export async function updateLesson(
  formData: FormData,
) {
  const { supabase, user } =
    await requireInstructor();

  const lessonId = String(
    formData.get("lessonId") ?? "",
  );

  const sectionId = String(
    formData.get("sectionId") ?? "",
  );

  const courseId = String(
    formData.get("courseId") ?? "",
  );

  const title = String(
    formData.get("title") ?? "",
  );

  const description = String(
    formData.get("description") ?? "",
  );

  const position = Number(
    formData.get("position") ?? 0,
  );

  const durationSeconds = Number(
    formData.get("durationSeconds") ?? 0,
  );

  const isPreview =
    formData.get("isPreview") === "true";

  const video = formData.get("video");

  if (!lessonId) {
    throw new Error(
      "Lesson ID is required.",
    );
  }

  await verifySectionOwnership(
    sectionId,
    courseId,
    user.id,
  );

  const {
    data: existingLesson,
    error: existingError,
  } = await supabase
    .from("lessons")
    .select("id, video_url")
    .eq("id", lessonId)
    .eq("section_id", sectionId)
    .single();

  if (
    existingError ||
    !existingLesson
  ) {
    throw new Error(
      "Lesson not found.",
    );
  }

  const parsed = lessonSchema.safeParse({
    title,
    description,
    position,
    durationSeconds,
    isPreview,
  });

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ??
        "Invalid lesson data.",
    );
  }

  let newVideoPath: string | null =
    null;

  /*
   * If instructor selected a new video:
   *
   * 1. Upload new video
   * 2. Update database
   * 3. Delete old video
   */
  if (
    video instanceof File &&
    video.size > 0
  ) {
    validateVideo(video);

    newVideoPath =
      await uploadVideo(
        supabase,
        video,
        user.id,
        courseId,
        lessonId,
      );
  }

  const {
    error: updateError,
  } = await supabase
    .from("lessons")
    .update({
      title: parsed.data.title,
      description:
        parsed.data.description || null,
      duration_seconds:
        parsed.data.durationSeconds,
      position: parsed.data.position,
      is_preview:
        parsed.data.isPreview,
      ...(newVideoPath
        ? {
            video_url:
              newVideoPath,
          }
        : {}),
    })
    .eq("id", lessonId)
    .eq("section_id", sectionId);

  if (updateError) {
    if (newVideoPath) {
      await deleteVideo(
        supabase,
        newVideoPath,
      );
    }

    throw new Error(
      updateError.message,
    );
  }

  /*
   * Only delete the old video after
   * the database has successfully
   * switched to the new video.
   */
  if (
    newVideoPath &&
    existingLesson.video_url
  ) {
    await deleteVideo(
      supabase,
      existingLesson.video_url,
    );
  }

  return {
    success: true,
    lessonId,
  };
}

/* -------------------------------------------------------------------------- */
/* DELETE LESSON                                                              */
/* -------------------------------------------------------------------------- */

export async function deleteLesson(
  lessonId: string,
  sectionId: string,
  courseId: string,
) {
  const { supabase, user } =
    await requireInstructor();

    console.log("CREATE LESSON DATA:", {
  sectionId,
  courseId,
  userId: user.id,
});

  await verifySectionOwnership(
    sectionId,
    courseId,
    user.id,
  );

  const {
    data: lesson,
    error: lessonError,
  } = await supabase
    .from("lessons")
    .select("id, video_url")
    .eq("id", lessonId)
    .eq("section_id", sectionId)
    .single();

  if (
    lessonError ||
    !lesson
  ) {
    throw new Error(
      "Lesson not found.",
    );
  }

  const {
    error: deleteError,
  } = await supabase
    .from("lessons")
    .delete()
    .eq("id", lessonId)
    .eq("section_id", sectionId);

  if (deleteError) {
    throw new Error(
      deleteError.message,
    );
  }

  /*
   * Delete the video after the
   * database lesson has been deleted.
   */
  if (lesson.video_url) {
    await deleteVideo(
      supabase,
      lesson.video_url,
    );
  }

  return {
    success: true,
  };
}