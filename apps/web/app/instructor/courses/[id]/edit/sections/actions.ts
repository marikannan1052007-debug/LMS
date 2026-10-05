"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

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

async function verifyCourseOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  courseId: string,
  userId: string,
) {
  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .eq("instructor_id", userId)
    .single();

  if (!course) {
    throw new Error(
      "Course not found or access denied.",
    );
  }

  return course;
}

/* ==========================================
   CREATE SECTION
========================================== */

export async function createSection(
  formData: FormData,
) {
  const { supabase, user } = await requireInstructor();

  const courseId = String(
    formData.get("course_id") ?? "",
  ).trim();

  const title = String(
    formData.get("title") ?? "",
  ).trim();

  if (!courseId) {
    throw new Error("Course ID is required.");
  }

  if (!title) {
    throw new Error("Section title is required.");
  }

  await verifyCourseOwnership(
    supabase,
    courseId,
    user.id,
  );

  const { data: lastSection } = await supabase
    .from("course_sections")
    .select("position")
    .eq("course_id", courseId)
    .order("position", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  const position =
    (lastSection?.position ?? -1) + 1;

  const { error } = await supabase
    .from("course_sections")
    .insert({
      course_id: courseId,
      title,
      position,
    });

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
  };
}

/* ==========================================
   UPDATE SECTION
========================================== */

export async function updateSection(
  formData: FormData,
) {
  const { supabase, user } = await requireInstructor();

  const sectionId = String(
    formData.get("section_id") ?? "",
  ).trim();

  const courseId = String(
    formData.get("course_id") ?? "",
  ).trim();

  const title = String(
    formData.get("title") ?? "",
  ).trim();

  if (!sectionId || !courseId) {
    throw new Error(
      "Section and course are required.",
    );
  }

  if (!title) {
    throw new Error("Section title is required.");
  }

  await verifyCourseOwnership(
    supabase,
    courseId,
    user.id,
  );

  const { error } = await supabase
    .from("course_sections")
    .update({
      title,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sectionId)
    .eq("course_id", courseId);

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
  };
}

/* ==========================================
   DELETE SECTION
========================================== */

export async function deleteSection(
  formData: FormData,
) {
  const { supabase, user } = await requireInstructor();

  const sectionId = String(
    formData.get("section_id") ?? "",
  ).trim();

  const courseId = String(
    formData.get("course_id") ?? "",
  ).trim();

  if (!sectionId || !courseId) {
    throw new Error(
      "Section and course are required.",
    );
  }

  await verifyCourseOwnership(
    supabase,
    courseId,
    user.id,
  );

  const { error } = await supabase
    .from("course_sections")
    .delete()
    .eq("id", sectionId)
    .eq("course_id", courseId);

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
  };
}