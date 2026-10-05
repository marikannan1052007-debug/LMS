import Link from "next/link";
import { redirect } from "next/navigation";

import { Header } from "@/components/Header";
import { CourseForm } from "@/components/CourseForm";
import { createClient } from "@/lib/supabase/server";
import { createCourse } from "../actions";

export default async function NewCoursePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in
  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Wrong role → logout → login page
  if (!profile || profile.role !== "instructor") {
    await supabase.auth.signOut();
    redirect("/auth/login");
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
         

          <h1 className="mt-5 text-3xl font-black tracking-tight">
            Create Course
          </h1>

          <p className="mt-2 text-sm text-[#6a6f73]">
            Start by adding the basic information about your course.
          </p>
        </div>

        <div className="border border-[#d1d7dc] bg-white p-8">
          <CourseForm action={createCourse} />
        </div>
      </div>
      </main>
    </>
  );
}