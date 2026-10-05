"use server";

import { createClient } from "@/lib/supabase/server";

interface EnrollmentStatus {
  authenticated: boolean;
  enrolled: boolean;
  completed: boolean;
}

interface Enrollment {
  course_id: string;
  is_completed: boolean;
}

interface EnrollmentActionResult {
  success: boolean;
  error?: string;
  alreadyEnrolled?: boolean;
}

export async function getEnrollmentStatus(
  courseId: string,
): Promise<EnrollmentStatus> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      authenticated: false,
      enrolled: false,
      completed: false,
    };
  }

  const { data: enrollments, error } = await supabase.rpc(
    "get_my_enrollments",
  );

  if (error) {
    console.error(
      "Failed to get enrollment status:",
      error,
    );

    return {
      authenticated: true,
      enrolled: false,
      completed: false,
    };
  }

  const enrollment = (enrollments ?? []).find(
    (item: Enrollment) => item.course_id === courseId,
  );

  if (!enrollment) {
    return {
      authenticated: true,
      enrolled: false,
      completed: false,
    };
  }

  return {
    authenticated: true,
    enrolled: true,
    completed: enrollment.is_completed === true,
  };
}

export async function enrollInCourse(
  courseId: string,
): Promise<EnrollmentActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Please log in before enrolling.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      success: false,
      error: "Unable to load your profile.",
    };
  }

  if (profile.role !== "student") {
    return {
      success: false,
      error: "Only students can enroll in courses.",
    };
  }

  const { data: existingEnrollment, error: enrollmentCheckError } =
    await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

  if (enrollmentCheckError) {
    console.error(
      "Failed to check existing enrollment:",
      enrollmentCheckError,
    );

    return {
      success: false,
      error: "Unable to check your enrollment.",
    };
  }

  if (existingEnrollment) {
    return {
      success: true,
      alreadyEnrolled: true,
    };
  }

  const { error } = await supabase.from("enrollments").insert({
    student_id: user.id,
    course_id: courseId,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    alreadyEnrolled: false,
  };
}