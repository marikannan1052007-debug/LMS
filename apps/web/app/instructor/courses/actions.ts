"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { courseSchema } from "@/lib/validations/course";

const THUMBNAIL_BUCKET =
  "course-thumbnails";

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function requireInstructor() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "instructor") {
    await supabase.auth.signOut();

    redirect("/auth/login");
  }

  return {
    supabase,
    user,
  };
}

async function uploadThumbnail(
  supabase: Awaited<
    ReturnType<typeof createClient>
  >,
  userId: string,
  courseId: string,
  file: File,
) {
  if (!file || file.size === 0) {
    return null;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Thumbnail must be a JPG, PNG, or WebP image.",
    );
  }

  const maxSize =
    5 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error(
      "Thumbnail image must be smaller than 5 MB.",
    );
  }

  const extensionMap: Record<
    string,
    string
  > = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  const extension =
    extensionMap[file.type];

  if (!extension) {
    throw new Error(
      "Unsupported thumbnail image type.",
    );
  }

  const filePath =
    `${userId}/${courseId}/${crypto.randomUUID()}.${extension}`;

  const fileBuffer =
    await file.arrayBuffer();

  const {
    error: uploadError,
  } = await supabase.storage
    .from(THUMBNAIL_BUCKET)
    .upload(
      filePath,
      fileBuffer,
      {
        contentType: file.type,
        upsert: false,
      },
    );

  if (uploadError) {
    throw new Error(
      `Thumbnail upload failed: ${uploadError.message}`,
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from(THUMBNAIL_BUCKET)
    .getPublicUrl(filePath);

  return publicUrl;
}

/* =========================================================
   CREATE COURSE
========================================================= */

export async function createCourse(
  formData: FormData,
) {
  const {
    supabase,
    user,
  } = await requireInstructor();

  const title = String(
    formData.get("title") ?? "",
  );

  const description = String(
    formData.get("description") ?? "",
  );

  const category = String(
    formData.get("category") ?? "",
  );

  const level = String(
    formData.get("level") ?? "",
  );

  const price =
    formData.get("price");

  /*
   * Server-side Zod validation.
   *
   * Never rely only on client-side validation.
   */
  const validation =
    courseSchema.safeParse({
      title,
      description,
      category,
      level,
      price,
    });

  if (!validation.success) {
    throw new Error(
      validation.error.issues[0]?.message ??
        "Invalid course details.",
    );
  }

  const {
    title: validatedTitle,
    description:
      validatedDescription,
    category:
      validatedCategory,
    level: validatedLevel,
    price: validatedPrice,
  } = validation.data;

  /*
   * Generate slug from the validated title.
   */
  const slug =
    createSlug(validatedTitle);

  if (!slug) {
    throw new Error(
      "A valid course slug is required.",
    );
  }

  /*
   * Create the course first so we have
   * a course ID for the thumbnail path.
   */
  const {
    data: course,
    error,
  } = await supabase
    .from("courses")
    .insert({
      instructor_id: user.id,
      title: validatedTitle,
      slug,
      description:
        validatedDescription || null,
      category:
        validatedCategory || null,
      level: validatedLevel,
      price: validatedPrice,
      thumbnail_url: null,
      published: false,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "That course slug already exists. Please choose a different course title.",
      );
    }

    throw new Error(
      error.message,
    );
  }

  /*
   * Upload thumbnail if selected.
   */
  const thumbnail =
    formData.get("thumbnail");

  if (
    thumbnail instanceof File &&
    thumbnail.size > 0
  ) {
    try {
      const thumbnailUrl =
        await uploadThumbnail(
          supabase,
          user.id,
          course.id,
          thumbnail,
        );

      const {
        error: updateError,
      } = await supabase
        .from("courses")
        .update({
          thumbnail_url:
            thumbnailUrl,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", course.id)
        .eq(
          "instructor_id",
          user.id,
        );

      if (updateError) {
        throw new Error(
          updateError.message,
        );
      }
    } catch (error) {
      /*
       * Roll back course creation
       * if thumbnail processing fails.
       */
      await supabase
        .from("courses")
        .delete()
        .eq("id", course.id)
        .eq(
          "instructor_id",
          user.id,
        );

      throw error;
    }
  }

  redirect(
    `/instructor/courses/${course.id}/edit`,
  );
}

/* =========================================================
   UPDATE COURSE
========================================================= */

export async function updateCourse(
  formData: FormData,
) {
  const {
    supabase,
    user,
  } = await requireInstructor();

  const courseId =
    String(
      formData.get("course_id") ?? "",
    ).trim();

  if (!courseId) {
    throw new Error(
      "Course ID is required.",
    );
  }

  const title = String(
    formData.get("title") ?? "",
  );

  const description = String(
    formData.get("description") ?? "",
  );

  const category = String(
    formData.get("category") ?? "",
  );

  const level = String(
    formData.get("level") ?? "",
  );

  const price =
    formData.get("price");

  /*
   * Server-side Zod validation.
   */
  const validation =
    courseSchema.safeParse({
      title,
      description,
      category,
      level,
      price,
    });

  if (!validation.success) {
    throw new Error(
      validation.error.issues[0]?.message ??
        "Invalid course details.",
    );
  }

  const {
    title: validatedTitle,
    description:
      validatedDescription,
    category:
      validatedCategory,
    level: validatedLevel,
    price: validatedPrice,
  } = validation.data;

  /*
   * Generate slug from validated title.
   */
  const slug =
    createSlug(validatedTitle);

  if (!slug) {
    throw new Error(
      "A valid course slug is required.",
    );
  }

  /*
   * Verify ownership and retrieve
   * current thumbnail.
   */
  const {
    data: existingCourse,
    error: existingError,
  } = await supabase
    .from("courses")
    .select(
      "id, thumbnail_url",
    )
    .eq("id", courseId)
    .eq(
      "instructor_id",
      user.id,
    )
    .single();

  if (
    existingError ||
    !existingCourse
  ) {
    throw new Error(
      "Course not found or access denied.",
    );
  }

  let thumbnailUrl =
    existingCourse.thumbnail_url;

  /*
   * Upload replacement thumbnail
   * if one was selected.
   */
  const thumbnail =
    formData.get("thumbnail");

  if (
    thumbnail instanceof File &&
    thumbnail.size > 0
  ) {
    thumbnailUrl =
      await uploadThumbnail(
        supabase,
        user.id,
        courseId,
        thumbnail,
      );
  }

  const {
    error,
  } = await supabase
    .from("courses")
    .update({
      title: validatedTitle,
      slug,
      description:
        validatedDescription || null,
      category:
        validatedCategory || null,
      level: validatedLevel,
      price: validatedPrice,
      thumbnail_url:
        thumbnailUrl,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", courseId)
    .eq(
      "instructor_id",
      user.id,
    );

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "That course slug already exists. Please choose a different course title.",
      );
    }

    throw new Error(
      error.message,
    );
  }

  redirect(
    `/instructor/courses/${courseId}/edit`,
  );
}

/* =========================================================
   DELETE COURSE
========================================================= */

export async function deleteCourse(
  formData: FormData,
) {
  const {
    supabase,
    user,
  } = await requireInstructor();

  const courseId =
    String(
      formData.get("course_id") ?? "",
    ).trim();

  if (!courseId) {
    throw new Error(
      "Course ID is required.",
    );
  }

  const {
    error,
  } = await supabase
    .from("courses")
    .delete()
    .eq("id", courseId)
    .eq(
      "instructor_id",
      user.id,
    );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  redirect(
    "/instructor/courses",
  );
}

/* =========================================================
   TOGGLE PUBLISHED
========================================================= */

export async function toggleCoursePublished(
  formData: FormData,
) {
  const {
    supabase,
    user,
  } = await requireInstructor();

  const courseId =
    String(
      formData.get("course_id") ?? "",
    ).trim();

  if (!courseId) {
    throw new Error(
      "Course ID is required.",
    );
  }

  const {
    data: course,
    error: courseError,
  } = await supabase
    .from("courses")
    .select(
      "id, published",
    )
    .eq("id", courseId)
    .eq(
      "instructor_id",
      user.id,
    )
    .single();

  if (
    courseError ||
    !course
  ) {
    throw new Error(
      "Course not found or access denied.",
    );
  }

  const {
    error,
  } = await supabase
    .from("courses")
    .update({
      published:
        !course.published,
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", courseId)
    .eq(
      "instructor_id",
      user.id,
    );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  redirect(
    `/instructor/courses/${courseId}/edit`,
  );
}