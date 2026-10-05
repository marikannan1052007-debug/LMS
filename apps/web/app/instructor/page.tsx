import { redirect } from "next/navigation";
import { InstructorCoursesList } from "@/components/InstructorCoursesList";
import { createClient } from "@/lib/supabase/server";

export default async function InstructorHomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Verify instructor profile role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "instructor") {
    await supabase.auth.signOut();
    redirect("/auth/login");
  }

  // Fetch courses owned by this instructor including enrollments
  const { data: coursesData } = await supabase
    .from("courses")
    .select(
      `
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
      enrollments ( id )
    `
    )
    .eq("instructor_id", user.id)
    .order("created_at", { ascending: false });

  const courses =
    coursesData?.map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      category: course.category,
      level: course.level,
      price: course.price,
      thumbnail_url: course.thumbnail_url,
      published: course.published,
      created_at: course.created_at,
      enrollment_count: Array.isArray(course.enrollments)
        ? course.enrollments.length
        : 0,
    })) || [];

  return <InstructorCoursesList courses={courses} />;
}