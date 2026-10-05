import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import EnrollmentRealtime from "@/components/EnrollmentRealtime";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";

interface Profile {
  full_name: string | null;
  role: string;
}

interface Enrollment {
  enrollment_id: string;
  enrolled_at: string;
  course_id: string;
  slug: string;
  title: string;
  thumbnail_url: string | null;
  category: string | null;
  level: string | null;
  description: string | null;
  progress_percent: number | null;
  is_completed: boolean;
  completed_lessons: number;
  total_lessons: number;
  next_lesson_id: string | null;
  next_lesson_title: string | null;
}

function getProgress(value: number | null) {
  return Math.min(100, Math.max(0, Number(value ?? 0)));
}

function getInitials(name: string | null) {
  if (!name?.trim()) {
    return "S";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default async function DashboardPage() {
  const supabase = await createClient();

  /*
   * --------------------------------------------------
   * Authentication
   * --------------------------------------------------
   */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  /*
   * --------------------------------------------------
   * Load profile
   * --------------------------------------------------
   */

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return (
      <main className="min-h-screen bg-[#f7f8fa] px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-10 shadow-sm">
            <h1 className="text-3xl font-black tracking-tight text-gray-950">
              Dashboard
            </h1>

            <p className="mt-3 text-sm text-gray-500">
              We couldn&apos;t load your profile.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * --------------------------------------------------
   * Role protection
   * --------------------------------------------------
   */

  if (profile.role === "instructor") {
    await supabase.auth.signOut();
    redirect("/auth/login");
  }

  /*
   * --------------------------------------------------
   * Load all enrollment information
   *
   * The RPC now also returns the next lesson.
   * This removes the previous N+1 query pattern.
   * --------------------------------------------------
   */

  const { data: enrollments, error: enrollmentError } =
    await supabase.rpc("get_my_enrollments");

  if (enrollmentError) {
    console.error(
      "Failed to load enrollments:",
      enrollmentError,
    );
  }

  const studentEnrollments =
    (enrollments ?? []) as Enrollment[];

  /*
   * --------------------------------------------------
   * Dashboard calculations
   * --------------------------------------------------
   */

  const enrolledCount = studentEnrollments.length;

  const completedCourses = studentEnrollments.filter(
    (enrollment) => enrollment.is_completed,
  );

  const activeCourses = studentEnrollments
    .filter((enrollment) => !enrollment.is_completed)
    .sort(
      (a, b) =>
        Number(b.progress_percent ?? 0) -
        Number(a.progress_percent ?? 0),
    );

  const completedCount = completedCourses.length;

  const totalCompletedLessons = studentEnrollments.reduce(
    (total, enrollment) =>
      total + Number(enrollment.completed_lessons ?? 0),
    0,
  );

  const totalLessons = studentEnrollments.reduce(
    (total, enrollment) =>
      total + Number(enrollment.total_lessons ?? 0),
    0,
  );

  const overallProgress =
    totalLessons > 0
      ? Math.round(
          (totalCompletedLessons / totalLessons) * 100,
        )
      : 0;

  const firstName =
    profile.full_name?.trim().split(/\s+/)[0] || "Student";

  const initials = getInitials(profile.full_name);

  return (
    
    <main className="min-h-screen bg-[#f7f8fa]">
      <EnrollmentRealtime />
      <Header />

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-purple-300/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-[32rem] w-[32rem] rounded-full bg-indigo-300/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">

        {/* ==================================================
            HERO
        ================================================== */}

        <section className="relative overflow-hidden rounded-[2rem] bg-[#18181b] shadow-2xl shadow-gray-300/30">

          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative px-6 py-10 sm:px-8 lg:px-10 lg:py-12">

            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-2xl">

                {/* Small badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-purple-200 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-300" />
                  Student Dashboard
                </div>

                <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Welcome back,
                  <span className="block bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
                    {firstName}.
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-7 text-gray-400 sm:text-base">
                  Continue where you left off, track your
                  progress, and keep building your skills.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">

                  <Link
                    href="/courses-marketplace"
                    className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-gray-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-gray-100"
                  >
                     Browse marketplace
                  </Link>

                  

                </div>
              </div>

              {/* Overall progress */}
              <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:w-80">

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                      Overall progress
                    </p>

                    <p className="mt-2 text-4xl font-black text-white">
                      {overallProgress}%
                    </p>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/15 text-xl font-black text-purple-200">
                    {initials}
                  </div>
                </div>

                <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 transition-all duration-700"
                    style={{
                      width: `${overallProgress}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  {totalCompletedLessons} of{" "}
                  {totalLessons} lessons completed
                </p>

              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            STATS
        ================================================== */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                  Enrolled
                </p>

                <p className="mt-3 text-4xl font-black tracking-tight text-gray-950">
                  {enrolledCount}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Courses in your library
                </p>
              </div>

              
            </div>
          </div>

          <div className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                  In progress
                </p>

                <p className="mt-3 text-4xl font-black tracking-tight text-gray-950">
                  {activeCourses.length}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Courses currently learning
                </p>
              </div>

              
            </div>
          </div>

          <div className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:col-span-2 lg:col-span-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                  Completed
                </p>

                <p className="mt-3 text-4xl font-black tracking-tight text-gray-950">
                  {completedCount}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Courses finished
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-xl">
                ✓
              </div>
            </div>
          </div>

        </section>

        {/* ==================================================
            MY COURSES
        ================================================== */}

        <section className="mt-10">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5624d0]">
                Your learning
              </p>

              <h2 className="mt-1 text-3xl font-black tracking-tight text-gray-950">
                My courses
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Pick up exactly where you left off.
              </p>
            </div>

            

          </div>

          {/* Active courses */}

          {activeCourses.length > 0 ? (

            <div className="mt-6 grid gap-5">

              {activeCourses.map((enrollment) => {

                const progress = getProgress(
                  enrollment.progress_percent,
                );

                const resumeHref = enrollment.next_lesson_id
                  ? `/courses/${enrollment.slug}/learn?lesson=${enrollment.next_lesson_id}`
                  : `/courses/${enrollment.slug}/learn`;

                return (
                  <article
                    key={enrollment.enrollment_id}
                    className="group overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gray-200/70"
                  >
                    <div className="flex flex-col lg:flex-row">

                      {/* Thumbnail */}

                      <Link
                        href={resumeHref}
                        className="relative block h-56 w-full shrink-0 overflow-hidden bg-gray-100 lg:h-auto lg:min-h-[280px] lg:w-[340px]"
                      >
                        {enrollment.thumbnail_url ? (
                          <Image
                            src={enrollment.thumbnail_url}
                            alt={enrollment.title}
                            fill
                            priority={false}
                            className="object-cover transition duration-500 group-hover:scale-105"
                            sizes="(max-width: 1024px) 100vw, 340px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
                            <span className="text-sm font-bold text-purple-400">
                              Course image
                            </span>
                          </div>
                        )}

                        {/* Image overlay */}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

                        
                      </Link>

                      {/* Content */}

                      <div className="flex flex-1 flex-col p-6 lg:p-8">

                        <div className="flex flex-1 flex-col">

                          {/* Meta */}

                          <div className="flex flex-wrap items-center gap-2">
                            {enrollment.category && (
                              <span className="rounded-full bg-purple-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#5624d0]">
                                {enrollment.category}
                              </span>
                            )}

                            {enrollment.level && (
                              <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold capitalize text-gray-500">
                                {enrollment.level}
                              </span>
                            )}
                          </div>

                          <Link href={resumeHref}>
                            <h3 className="mt-4 text-2xl font-black tracking-tight text-gray-950 transition group-hover:text-[#5624d0]">
                              {enrollment.title}
                            </h3>
                          </Link>

                          {enrollment.description && (
                            <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-gray-500">
                              {enrollment.description}
                            </p>
                          )}

                          {/* Progress */}

                          <div className="mt-7 max-w-3xl">

                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                  Course progress
                                </p>

                                <p className="mt-1 text-sm font-bold text-gray-900">
                                  {enrollment.completed_lessons} of{" "}
                                  {enrollment.total_lessons} lessons
                                </p>
                              </div>

                              <span className="text-2xl font-black text-[#5624d0]">
                                {progress}%
                              </span>
                            </div>

                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#5624d0] to-indigo-500 transition-all duration-700"
                                style={{
                                  width: `${progress}%`,
                                }}
                              />
                            </div>

                          </div>

                          {/* Next lesson */}

                          {enrollment.next_lesson_title && (
                            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-[#5624d0] shadow-sm">
                                →
                              </div>

                              <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                  Up next
                                </p>

                                <p className="mt-0.5 truncate text-sm font-bold text-gray-900">
                                  {enrollment.next_lesson_title}
                                </p>
                              </div>

                            </div>
                          )}

                        </div>

                        {/* Action */}

                        <div className="mt-7 flex flex-wrap items-center gap-3">

                          <Link
                            href={resumeHref}
                            className="inline-flex items-center justify-center rounded-xl bg-[#5624d0] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 transition duration-200 hover:-translate-y-0.5 hover:bg-[#401b9b] hover:shadow-xl"
                          >
                            Continue learning
                            <span className="ml-2 transition-transform group-hover:translate-x-1">
                              →
                            </span>
                          </Link>

                          

                        </div>

                      </div>
                    </div>
                  </article>
                );
              })}

            </div>

          ) : completedCourses.length > 0 ? (

            /* ==================================================
               COMPLETED STATE
            ================================================== */

            <div className="mt-6 rounded-[1.75rem] border border-gray-200 bg-white p-8 shadow-sm sm:p-10">

              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-3xl text-green-600">
                  ✓
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-600">
                    Milestone reached
                  </p>

                  <h3 className="mt-1 text-2xl font-black tracking-tight text-gray-950">
                    All your courses are complete.
                  </h3>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                    Excellent work. You can revisit any completed
                    course or discover something new.
                  </p>
                </div>

              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                {completedCourses.map((enrollment) => (
                  <Link
                    key={enrollment.enrollment_id}
                    href={`/courses/${enrollment.slug}/learn`}
                    className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    Review {enrollment.title}
                  </Link>
                ))}
              </div>

            </div>

          ) : (

            /* ==================================================
               EMPTY STATE
            ================================================== */

            <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white shadow-sm">

              <div className="relative px-6 py-14 text-center sm:px-10">

                <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-purple-100/60 blur-3xl" />

                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-3xl">
                  📚
                </div>

                <h3 className="relative mt-6 text-2xl font-black tracking-tight text-gray-950">
                  Start your learning journey
                </h3>

                <p className="relative mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                  You haven&apos;t enrolled in any courses yet.
                  Explore the marketplace and find something
                  worth learning.
                </p>

                <Link
                  href="/courses-marketplace"
                  className="relative mt-7 inline-flex rounded-xl bg-[#5624d0] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:bg-[#401b9b]"
                >
                  Explore courses →
                </Link>

              </div>

            </div>
          )}

        </section>

        {/* ==================================================
            DISCOVER CTA
        ================================================== */}

        
      </div>
    </main>
  );
}