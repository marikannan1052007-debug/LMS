import { redirect } from "next/navigation";

import { InstructorCoursesList } from "@/components/InstructorCoursesList";
import { createClient } from "@/lib/supabase/server";

export default async function InstructorCoursesPage() {
  const supabase = await createClient();

  // --------------------------------------------------
  // Authentication
  // --------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // --------------------------------------------------
  // Role protection
  // --------------------------------------------------

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "instructor") {
    await supabase.auth.signOut();
    redirect("/auth/login");
  }

  // --------------------------------------------------
  // Load instructor courses
  //
  // enrollments(count) gives us the number of students
  // enrolled in each course.
  // --------------------------------------------------

  const { data: courses, error } = await supabase
    .from("courses")
    .select(`
      id,
      title,
      slug,
      description,
      category,
      level,
      price,
      thumbnail_url,
      published,
      created_at,
      enrollments(count)
    `)
    .eq("instructor_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  // --------------------------------------------------
  // Normalize Supabase response
  // --------------------------------------------------

  const normalizedCourses = (courses ?? []).map((course) => {
    const enrollmentCount =
      Array.isArray(course.enrollments) &&
      course.enrollments.length > 0
        ? Number(course.enrollments[0].count ?? 0)
        : 0;

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      category: course.category,
      level: course.level,
      price: Number(course.price),
      thumbnail_url: course.thumbnail_url,
      published: course.published,
      created_at: course.created_at,
      enrollment_count: enrollmentCount,
    };
  });

  return (
    <InstructorCoursesList
      courses={normalizedCourses}
    />
  );
}