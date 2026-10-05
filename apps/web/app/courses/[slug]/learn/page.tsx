import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Header } from "@/components/Header";
import { LessonPlayer } from "@/components/LessonPlayer";
import { createClient } from "@/lib/supabase/server";

type LearnPageProps = {
  params: Promise<{
    slug: string;
  }>;

  searchParams: Promise<{
    lesson?: string;
  }>;
};

export default async function LearnPage({
  params,
  searchParams,
}: LearnPageProps) {
  const { slug } = await params;
  const { lesson: lessonId } = await searchParams;

  const supabase = await createClient();

  // --------------------------------------------------
  // AUTHENTICATION
  // --------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?redirect=/courses/${slug}/learn`);
  }

  // --------------------------------------------------
  // ROLE CHECK
  // --------------------------------------------------

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
    await supabase.auth.signOut();
    redirect("/auth/login");
  }

  // --------------------------------------------------
  // COURSE
  // --------------------------------------------------

  const { data: course, error: courseError } =
    await supabase
      .from("courses")
      .select(`
        id,
        title,
        slug,
        description,
        instructor_id
      `)
      .eq("slug", slug)
      .eq("published", true)
      .single();

  if (courseError || !course) {
    notFound();
  }

  // --------------------------------------------------
  // ENROLLMENT
  // --------------------------------------------------

  const {
    data: enrollment,
    error: enrollmentError,
  } = await supabase
    .from("enrollments")
    .select(`
      id,
      progress_percent
    `)
    .eq("student_id", user.id)
    .eq("course_id", course.id)
    .maybeSingle();

  if (enrollmentError) {
    throw new Error(enrollmentError.message);
  }

  if (!enrollment) {
    redirect(`/courses/${course.slug}`);
  }

  // --------------------------------------------------
  // SECTIONS + VIDEO LESSONS
  // --------------------------------------------------

  const {
    data: sections,
    error: sectionsError,
  } = await supabase
    .from("course_sections")
    .select(`
      id,
      title,
      position,
      lessons (
        id,
        title,
        description,
        video_url,
        duration_seconds,
        position,
        is_preview
      )
    `)
    .eq("course_id", course.id)
    .order("position", {
      ascending: true,
    });

  if (sectionsError) {
    throw new Error(sectionsError.message);
  }

  // --------------------------------------------------
  // SORT SECTIONS + LESSONS
  // --------------------------------------------------

  const orderedSections = [...(sections ?? [])].sort(
    (a, b) => a.position - b.position,
  );

  const lessons = orderedSections.flatMap(
    (section) =>
      [...(section.lessons ?? [])]
        .sort(
          (a, b) =>
            a.position - b.position,
        )
        .map((lesson) => ({
          ...lesson,
          sectionId: section.id,
          sectionTitle: section.title,
          sectionPosition: section.position,
        })),
  );

  // --------------------------------------------------
  // EMPTY COURSE
  // --------------------------------------------------

  if (lessons.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-[#5624d0]"
          >
            ← Back to dashboard
          </Link>

          <div className="mt-6 border bg-white p-8">
            <h1 className="text-3xl font-black text-gray-900">
              {course.title}
            </h1>

            <p className="mt-4 text-gray-600">
              This course does not have any
              lessons yet.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // SELECT LESSON
  // --------------------------------------------------

  let selectedIndex = 0;

  if (lessonId) {
    const foundIndex = lessons.findIndex(
      (lesson) => lesson.id === lessonId,
    );

    if (foundIndex !== -1) {
      selectedIndex = foundIndex;
    }
  }

  const selectedLesson =
    lessons[selectedIndex];

  const previousLesson =
    selectedIndex > 0
      ? lessons[selectedIndex - 1]
      : null;

  const nextLesson =
    selectedIndex <
    lessons.length - 1
      ? lessons[selectedIndex + 1]
      : null;

  // --------------------------------------------------
  // LESSON PROGRESS
  // --------------------------------------------------

  const lessonIds = lessons.map(
    (lesson) => lesson.id,
  );

  let completedIds = new Set<string>();

  if (lessonIds.length > 0) {
    const {
      data: progress,
      error: progressError,
    } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("student_id", user.id)
      .eq("completed", true)
      .in("lesson_id", lessonIds);

    if (progressError) {
      throw new Error(
        progressError.message,
      );
    }

    completedIds = new Set(
      (progress ?? []).map(
        (item) => item.lesson_id,
      ),
    );
  }

  // --------------------------------------------------
  // CURRENT LESSON STATUS
  // --------------------------------------------------

  const completed = completedIds.has(
    selectedLesson.id,
  );

  const progressPercent = Math.round(
    (completedIds.size /
      lessons.length) *
      100,
  );

  const isLastLesson =
    selectedIndex ===
    lessons.length - 1;

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-gray-50">
      <Header contextTitle={course.title} />

      {/* MAIN LEARNING AREA */}

      <div
        className="
          relative
          mx-auto
          grid
          max-w-[1440px]
          gap-8
          px-4
          py-8
          lg:grid-cols-[340px_1fr]
          lg:px-8
        "
      >
        {/* Ambient background */}

        <div
          className="
            pointer-events-none
            absolute
            -left-32
            top-20
            h-72
            w-72
            rounded-full
            bg-purple-400/10
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            right-0
            top-0
            h-96
            w-96
            rounded-full
            bg-indigo-400/10
            blur-3xl
          "
        />

        {/* SIDEBAR */}

        <aside className="relative h-fit lg:sticky lg:top-24">
          <div
            className="
              overflow-hidden
              rounded-3xl
              border
              border-gray-200/70
              bg-white
              shadow-xl
              shadow-gray-200/40
            "
          >
            {/* PROGRESS */}

            <div className="border-b border-gray-100 p-6">
              <div className="flex items-end justify-between">
                <div>
                  <p
                    className="
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-gray-400
                    "
                  >
                    Course progress
                  </p>

                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-black tracking-tight text-gray-950">
                      {progressPercent}%
                    </span>

                    <span className="text-xs font-medium text-gray-500">
                      complete
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold text-gray-500">
                  {completedIds.size}/
                  {lessons.length}
                </span>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="
                    h-full
                    rounded-full
                    bg-gradient-to-r
                    from-[#5624d0]
                    to-indigo-500
                    transition-all
                    duration-700
                  "
                  style={{
                    width: `${progressPercent}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-[11px] text-gray-400">
                {completedIds.size} of{" "}
                {lessons.length} lessons
                completed
              </p>
            </div>

            {/* COURSE CONTENT */}

            <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
              {orderedSections.map(
                (
                  section,
                  sectionIndex,
                ) => {
                  const sectionLessons = [
                    ...(section.lessons ?? []),
                  ].sort(
                    (a, b) =>
                      a.position -
                      b.position,
                  );

                  const completedSectionLessons =
                    sectionLessons.filter(
                      (lesson) =>
                        completedIds.has(
                          lesson.id,
                        ),
                    ).length;

                  const sectionCompleted =
                    sectionLessons.length >
                      0 &&
                    completedSectionLessons ===
                      sectionLessons.length;

                  return (
                    <div
                      key={section.id}
                      className="
                        border-b
                        border-gray-100
                        last:border-b-0
                      "
                    >
                      {/* SECTION HEADER */}

                      <div className="bg-white px-5 pb-4 pt-5">
                        <div className="flex items-start gap-3">
                          {/* Section number */}

                          <div
                            className="
                              flex
                              h-9
                              w-9
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              bg-gradient-to-br
                              from-purple-50
                              to-indigo-50
                              text-xs
                              font-black
                              text-[#5624d0]
                              ring-1
                              ring-purple-100
                            "
                          >
                            {String(
                              sectionIndex +
                                1,
                            ).padStart(
                              2,
                              "0",
                            )}
                          </div>

                          {/* Section title */}

                          <div className="min-w-0 flex-1">
                            <p
                              className="
                                text-[9px]
                                font-bold
                                uppercase
                                tracking-[0.18em]
                                text-gray-400
                              "
                            >
                              Section{" "}
                              {sectionIndex +
                                1}
                            </p>

                            <h2
                              className="
                                mt-1
                                text-sm
                                font-black
                                leading-5
                                text-gray-950
                              "
                            >
                              {section.title}
                            </h2>

                            <p className="mt-1 text-[11px] font-medium text-gray-400">
                              {
                                completedSectionLessons
                              }
                              /
                              {
                                sectionLessons.length
                              }{" "}
                              lessons
                              completed
                            </p>
                          </div>

                          {/* Section completed */}

                          {sectionCompleted && (
                            <span
                              className="
                                flex
                                h-7
                                w-7
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-green-100
                                text-xs
                                font-bold
                                text-green-700
                              "
                            >
                              ✓
                            </span>
                          )}
                        </div>
                      </div>

                      {/* LESSONS */}

                      {sectionLessons.length >
                        0 && (
                        <div
                          className="
                            border-t
                            border-gray-100
                            bg-gray-50/60
                            px-3
                            pb-3
                            pt-3
                          "
                        >
                          <div
                            className="
                              mb-2
                              px-3
                              text-[9px]
                              font-bold
                              uppercase
                              tracking-[0.18em]
                              text-gray-400
                            "
                          >
                            Lessons
                          </div>

                          <div className="space-y-1">
                            {sectionLessons.map(
                              (lesson) => {
                                const isSelected =
                                  lesson.id ===
                                  selectedLesson.id;

                                const isCompleted =
                                  completedIds.has(
                                    lesson.id,
                                  );

                                return (
                                  <Link
                                    key={
                                      lesson.id
                                    }
                                    href={`/courses/${course.slug}/learn?lesson=${lesson.id}`}
                                    className={`
                                      group
                                      relative
                                      block
                                      rounded-xl
                                      px-3
                                      py-3
                                      transition-all
                                      duration-200
                                      ${
                                        isSelected
                                          ? "bg-white shadow-sm ring-1 ring-purple-100"
                                          : "hover:bg-white/80"
                                      }
                                    `}
                                  >
                                    {isSelected && (
                                      <span
                                        className="
                                          absolute
                                          bottom-2
                                          left-0
                                          top-2
                                          w-1
                                          rounded-full
                                          bg-[#5624d0]
                                        "
                                      />
                                    )}

                                    <div className="flex items-center gap-3">
                                      {/* Lesson status */}

                                      <span
                                        className={`
                                          flex
                                          h-7
                                          w-7
                                          shrink-0
                                          items-center
                                          justify-center
                                          rounded-full
                                          text-[10px]
                                          font-bold
                                          ${
                                            isCompleted
                                              ? "bg-green-100 text-green-700"
                                              : isSelected
                                                ? "bg-[#5624d0] text-white shadow-sm"
                                                : "bg-gray-200 text-gray-500"
                                          }
                                        `}
                                      >
                                        {isCompleted
                                          ? "✓"
                                          : ""}
                                      </span>

                                      {/* Lesson information */}

                                      <div className="min-w-0 flex-1">
                                        <p
                                          className={`
                                            truncate
                                            text-sm
                                            leading-5
                                            ${
                                              isSelected
                                                ? "font-bold text-[#5624d0]"
                                                : isCompleted
                                                  ? "font-medium text-gray-500"
                                                  : "font-medium text-gray-800"
                                            }
                                          `}
                                        >
                                          {
                                            lesson.title
                                          }
                                        </p>

                                        {isSelected && (
                                          <p
                                            className="
                                              mt-0.5
                                              text-[10px]
                                              font-semibold
                                              text-[#5624d0]/70
                                            "
                                          >
                                            Currently
                                            learning
                                          </p>
                                        )}

                                        {isCompleted &&
                                          !isSelected && (
                                            <p
                                              className="
                                                mt-0.5
                                                text-[10px]
                                                font-medium
                                                text-green-600
                                              "
                                            >
                                              Completed
                                            </p>
                                          )}
                                      </div>

                                      {/* Arrow */}

                                      <span
                                        className={`
                                          text-sm
                                          transition-all
                                          duration-200
                                          ${
                                            isSelected
                                              ? "text-[#5624d0]"
                                              : "text-gray-300 opacity-0 group-hover:translate-x-1 group-hover:opacity-100"
                                          }
                                        `}
                                      >
                                        →
                                      </span>
                                    </div>
                                  </Link>
                                );
                              },
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </aside>

        {/* LESSON PLAYER */}

        <section className="relative min-w-0">
          <div
            className="
              overflow-hidden
              rounded-3xl
              border
              border-gray-200/70
              bg-white
              shadow-xl
              shadow-gray-200/40
            "
          >
            <LessonPlayer
              key={selectedLesson.id}
              lesson={selectedLesson}
              courseId={course.id}
              courseSlug={course.slug}
              completed={completed}
              nextLesson={nextLesson}
              previousLesson={previousLesson}
              progressPercent={progressPercent}
              isLastLesson={isLastLesson}
            />
          </div>
        </section>
      </div>
    </main>
  );
}