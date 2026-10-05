
import { notFound, redirect } from "next/navigation";

import {
  ArrowLeft,
  BookOpen,
  Eye,
  Globe,
  Trash2,
} from "lucide-react";

import { CourseForm } from "@/components/CourseForm";
import ProcessingSubmitButton from "@/components/ProcessingSubmitButton";
import { SectionManager } from "@/components/instructor/SectionManager";

import {
  deleteCourse,
  toggleCoursePublished,
  updateCourse,
} from "../../actions";

import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";


type EditCoursePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCoursePage({
  params,
}: EditCoursePageProps) {
  const { id } = await params;

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
  // Instructor role check
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
  // Load course
  // --------------------------------------------------

  const { data: course, error } = await supabase
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
      published
    `)
    .eq("id", id)
    .eq("instructor_id", user.id)
    .single();

  if (error || !course) {
    notFound();
  }

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back to courses */}
        
          

        {/* ============================================
            COURSE EDITOR
        ============================================ */}

        <section
          className="
            mt-6
            overflow-hidden
            rounded-3xl
            border
            border-gray-200/80
            bg-white
            shadow-xl
            shadow-gray-200/30
          "
        >
          {/* ------------------------------------------
              Course header
          ------------------------------------------ */}

          <div className="relative overflow-hidden p-6 sm:p-8">
            {/* Background decoration */}
            <div
              className="
                pointer-events-none
                absolute
                -right-24
                -top-24
                h-72
                w-72
                rounded-full
                bg-purple-300/10
                blur-3xl
              "
            />

            <div
              className="
                relative
                flex
                flex-col
                gap-6
                lg:flex-row
                lg:items-start
                lg:justify-between
              "
            >
              {/* Course information */}
              <div className="min-w-0">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Course editor badge */}
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      bg-purple-50
                      px-3
                      py-1.5
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-[#5624d0]
                    "
                  >
                    <BookOpen className="h-3.5 w-3.5" />

                    Course editor
                  </span>

                  {/* Published / Draft */}
                  <span
                    className={`
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      px-3
                      py-1.5
                      text-[10px]
                      font-bold
                      ${
                        course.published
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }
                    `}
                  >
                    {course.published ? (
                      <Globe className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}

                    {course.published
                      ? "Published"
                      : "Draft"}
                  </span>
                </div>

                {/* Course title */}
                <h1
                  className="
                    mt-4
                    max-w-3xl
                    text-3xl
                    font-black
                    tracking-tight
                    text-gray-950
                    sm:text-4xl
                  "
                >
                  {course.title}
                </h1>

                {/* Description */}
                <p
                  className="
                    mt-3
                    max-w-2xl
                    text-sm
                    leading-6
                    text-gray-500
                    sm:text-base
                  "
                >
                  Manage your course information and build
                  your learning content.
                </p>
              </div>

              {/* --------------------------------------
                  Publish / Unpublish
              -------------------------------------- */}

              <form
                action={toggleCoursePublished}
                className="shrink-0"
              >
                <input
                  type="hidden"
                  name="course_id"
                  value={course.id}
                />

                <ProcessingSubmitButton
                  processingText={
                    course.published
                      ? "Unpublishing..."
                      : "Publishing..."
                  }
                  className={`
                    inline-flex
                    min-h-11
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    px-5
                    py-2.5
                    text-sm
                    font-bold
                    shadow-sm
                    transition-all
                    hover:-translate-y-0.5
                    hover:shadow-md
                    sm:w-auto
                    ${
                      course.published
                        ? `
                          border
                          border-gray-200
                          bg-white
                          text-gray-700
                          hover:bg-gray-50
                        `
                        : `
                          bg-[#5624d0]
                          text-white
                          hover:bg-[#401b9b]
                        `
                    }
                  `}
                >
                  {course.published ? (
                    <>
                      <Eye className="h-4 w-4" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4" />
                      Publish course
                    </>
                  )}
                </ProcessingSubmitButton>
              </form>
            </div>
          </div>

          {/* ==========================================
              COURSE INFORMATION
          ========================================== */}

          <div
            className="
              border-t
              border-gray-100
              bg-gray-50/40
              p-6
              sm:p-8
            "
          >
            <div className="mb-5">
              <h2
                className="
                  text-lg
                  font-black
                  text-gray-900
                "
              >
                Course information
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >
                Update the details students see in the
                marketplace.
              </p>
            </div>

            <CourseForm
              action={updateCourse}
              course={{
                id: course.id,
                title: course.title,
                slug: course.slug,
                description: course.description,
                category: course.category,
                level: course.level,
                price: Number(course.price),
                thumbnail_url: course.thumbnail_url,
              }}
            />
          </div>
        </section>

        {/* ============================================
            SECTIONS + LESSONS
        ============================================ */}

        <SectionManager courseId={course.id} />

        {/* ============================================
            DANGER ZONE
        ============================================ */}

        <section
          className="
            mt-8
            overflow-hidden
            rounded-3xl
            border
            border-red-200
            bg-white
            shadow-sm
          "
        >
          <div
            className="
              flex
              flex-col
              gap-5
              p-6
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:p-7
            "
          >
            {/* Delete information */}
            <div className="flex items-start gap-4">
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-red-50
                  text-red-600
                "
              >
                <Trash2 className="h-5 w-5" />
              </div>

              <div>
                <h2
                  className="
                    font-black
                    text-red-800
                  "
                >
                  Delete course
                </h2>

                <p
                  className="
                    mt-1
                    max-w-2xl
                    text-sm
                    leading-6
                    text-gray-500
                  "
                >
                  This permanently removes the course,
                  sections, lessons, enrollments, and
                  lesson progress.
                </p>
              </div>
            </div>

            {/* Delete button */}
            <form action={deleteCourse}>
              <input
                type="hidden"
                name="course_id"
                value={course.id}
              />

              <ProcessingSubmitButton
                processingText="Deleting course..."
                className="
                  inline-flex
                  min-h-11
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-red-200
                  bg-white
                  px-5
                  py-2.5
                  text-sm
                  font-bold
                  text-red-600
                  transition
                  hover:bg-red-50
                  sm:w-auto
                "
              >
                <Trash2 className="h-4 w-4" />
                Delete course
              </ProcessingSubmitButton>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}