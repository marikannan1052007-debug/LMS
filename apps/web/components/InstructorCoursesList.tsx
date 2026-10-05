"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  
  ArrowRight,
  
  BookOpen,
  CheckCircle2,
  Clock3,
  DollarSign,
 
  Plus,
  Search,
  Star,
  Users,
} from "lucide-react";
import { Header } from "@/components/Header";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  level: "beginner" | "intermediate" | "advanced" | null;
  price: number;
  thumbnail_url: string | null;
  published: boolean;
  created_at: string;
  enrollment_count: number;
};

type InstructorCoursesListProps = {
  courses: Course[];
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

export function InstructorCoursesList({ courses }: InstructorCoursesListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");

  // --------------------------------------------------
  // Consolidated Dashboard Statistics
  // --------------------------------------------------
  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const publishedCourses = courses.filter((c) => c.published).length;
    const draftCourses = totalCourses - publishedCourses;
    const totalStudents = courses.reduce(
      (sum, course) => sum + Number(course.enrollment_count ?? 0),
      0
    );
    const estimatedRevenue = courses.reduce(
      (sum, course) =>
        sum + Number(course.price ?? 0) * Number(course.enrollment_count ?? 0),
      0
    );

    return {
      totalCourses,
      publishedCourses,
      draftCourses,
      totalStudents,
      estimatedRevenue,
    };
  }, [courses]);

  // Filtered course items
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "published" && course.published) ||
        (filterStatus === "draft" && !course.published);

      return matchesSearch && matchesStatus;
    });
  }, [courses, searchQuery, filterStatus]);

  return (
    <main className="min-h-screen bg-[#f7f9fa]">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        
        {/* ================================================= */}
        {/* INSTRUCTOR QUICK NAVIGATION & HEADER */}
        {/* ================================================= */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          {/* Consolidated Sub-Navigation (Replaces Dashboard Links) */}
        

          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black tracking-tight text-[#1c1d1f] sm:text-4xl">
              Instructor Dashboard 
            </h1>
            <p className="text-sm leading-6 text-[#6a6f73] sm:text-base">
              Overview of your teaching reach, course metrics, and active content.
            </p>
          </div>
        </motion.div>

        {/* ================================================= */}
        {/* COMPREHENSIVE DASHBOARD METRICS */}
        {/* ================================================= */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="mb-8 grid overflow-hidden border border-[#d1d7dc] bg-white shadow-sm sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Total Revenue */}
          <div className="border-b border-[#d1d7dc] p-6 sm:border-r lg:border-b-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#6a6f73]">
                  Gross Earnings
                </p>
                <p className="mt-1 text-2xl font-black text-[#1c1d1f]">
                  ₹{stats.estimatedRevenue.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#6a6f73]">Lifetime total earnings</p>
          </div>

          {/* Total Students */}
          <div className="border-b border-[#d1d7dc] p-6 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#6a6f73]">
                  Total Enrolled
                </p>
                <p className="mt-1 text-2xl font-black text-[#1c1d1f]">
                  {stats.totalStudents}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#6a6f73]">Students across all courses</p>
          </div>

          {/* Total Courses */}
          <div className="border-b border-[#d1d7dc] p-6 sm:border-b-0 sm:border-r">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-[#5624d0]">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#6a6f73]">
                  Total Courses
                </p>
                <p className="mt-1 text-2xl font-black text-[#1c1d1f]">
                  {stats.totalCourses}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#6a6f73]">
              {stats.publishedCourses} published, {stats.draftCourses} drafts
            </p>
          </div>

          {/* Published Ratio */}
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#6a6f73]">
                  Active Courses
                </p>
                <p className="mt-1 text-2xl font-black text-[#1c1d1f]">
                  {stats.publishedCourses}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#6a6f73]">Live on the platform</p>
          </div>
        </motion.section>

        {/* ================================================= */}
        {/* SEARCH & FILTERS BAR */}
        {/* ================================================= */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 text-xs font-bold transition ${
                filterStatus === "all"
                  ? "bg-[#1c1d1f] text-white"
                  : "bg-white border border-[#d1d7dc] text-[#1c1d1f] hover:bg-gray-100"
              }`}
            >
              All ({courses.length})
            </button>
            <button
              onClick={() => setFilterStatus("published")}
              className={`px-4 py-2 text-xs font-bold transition ${
                filterStatus === "published"
                  ? "bg-[#1c1d1f] text-white"
                  : "bg-white border border-[#d1d7dc] text-[#1c1d1f] hover:bg-gray-100"
              }`}
            >
              Published ({stats.publishedCourses})
            </button>
            <button
              onClick={() => setFilterStatus("draft")}
              className={`px-4 py-2 text-xs font-bold transition ${
                filterStatus === "draft"
                  ? "bg-[#1c1d1f] text-white"
                  : "bg-white border border-[#d1d7dc] text-[#1c1d1f] hover:bg-gray-100"
              }`}
            >
              Drafts ({stats.draftCourses})
            </button>
          </div>

          <div className="relative min-w-[260px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6a6f73]" />
            <input
              type="text"
              placeholder="Search your courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-[#d1d7dc] bg-white py-2 pl-9 pr-4 text-sm font-medium text-[#1c1d1f] focus:border-[#1c1d1f] focus:outline-none"
            />
          </div>
        </div>

        {/* ================================================= */}
        {/* EMPTY STATES & COURSE LIST */}
        {/* ================================================= */}
        {courses.length === 0 ? (
          <motion.section
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="border border-[#d1d7dc] bg-white p-8 shadow-sm sm:p-12 text-center"
          >
            <div className="mx-auto flex max-w-lg flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eee8ff] text-[#5624d0]">
                <BookOpen className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-xl font-black sm:text-2xl">Create your first course</h2>
              <p className="mt-2 text-sm leading-6 text-[#6a6f73] sm:text-base">
                Start with a course title and build your curriculum with sections and lessons.
              </p>
              <Link
                href="/instructor/courses/new"
                className="group mt-6 inline-flex min-h-12 items-center justify-center gap-2 bg-[#5624d0] px-6 text-sm font-bold text-white transition hover:bg-[#401b9b]"
              >
                <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                Create your first course
              </Link>
            </div>
          </motion.section>
        ) : filteredCourses.length === 0 ? (
          <div className="border border-[#d1d7dc] bg-white p-12 text-center text-[#6a6f73]">
            No courses found matching your criteria.
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-5"
          >
            {filteredCourses.map((course) => (
              <motion.article
                key={course.id}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="group overflow-hidden border border-[#d1d7dc] bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Thumbnail */}
                  <div className="relative w-full shrink-0 overflow-hidden bg-gray-100 sm:h-56 lg:h-auto lg:w-72">
                    {course.thumbnail_url ? (
                      <Image
                        src={course.thumbnail_url}
                        alt={course.title}
                        width={640}
                        height={440}
                        className="h-56 w-full object-cover transition duration-500 group-hover:scale-105 lg:absolute lg:inset-0 lg:h-full"
                      />
                    ) : (
                      <div className="flex h-56 items-center justify-center bg-gradient-to-br from-[#f0ecff] to-[#f7f9fa] lg:absolute lg:inset-0 lg:h-full">
                        <div className="text-center">
                          <BookOpen className="mx-auto h-9 w-9 text-[#8b6ed8]" />
                          <p className="mt-2 text-xs font-bold text-[#6a6f73]">No thumbnail</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute left-3 top-3 lg:hidden">
                      <CourseStatus published={course.published} />
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:p-7">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-start gap-3">
                        <h2 className="min-w-0 text-xl font-black leading-tight text-[#1c1d1f] sm:text-2xl">
                          {course.title}
                        </h2>
                        <div className="hidden lg:block">
                          <CourseStatus published={course.published} />
                        </div>
                      </div>

                      <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-[#6a6f73]">
                        {course.description || "No course description yet."}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        {course.category && (
                          <span className="font-semibold text-[#1c1d1f]">{course.category}</span>
                        )}
                        {course.level && (
                          <span className="inline-flex items-center gap-1.5 text-[#6a6f73]">
                            <Clock3 className="h-4 w-4" />
                            <span className="capitalize">{course.level}</span>
                          </span>
                        )}
                        <span className="font-bold text-[#1c1d1f]">
                          {Number(course.price) === 0
                            ? "Free"
                            : `₹${Number(course.price).toFixed(2)}`}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[#1c1d1f]">
                          <Users className="h-4 w-4 text-[#5624d0]" />
                          {course.enrollment_count}{" "}
                          {course.enrollment_count === 1 ? "student" : "students"}
                        </span>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="w-full shrink-0 lg:w-auto">
                      <Link
                        href={`/instructor/courses/${course.id}/edit`}
                        className="group/button inline-flex min-h-12 w-full items-center justify-center gap-2 border border-[#1c1d1f] px-5 text-sm font-bold text-[#1c1d1f] transition hover:bg-[#1c1d1f] hover:text-white sm:w-auto"
                      >
                        Manage Course
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}

function CourseStatus({ published }: { published: boolean }) {
  if (published) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Published
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 bg-yellow-100 px-2.5 py-1 text-xs font-bold text-yellow-700">
      <Clock3 className="h-3.5 w-3.5" />
      Draft
    </span>
  );
}