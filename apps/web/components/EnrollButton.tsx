"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Loader2, AlertCircle } from "lucide-react";

import {
  enrollInCourse,
  getEnrollmentStatus,
} from "@/app/courses/[slug]/actions";
import { createClient } from "@/lib/supabase/client";

type EnrollButtonProps = {
  courseId: string;
  courseSlug: string;
};

export function EnrollButton({ courseId, courseSlug }: EnrollButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  // Fetch or refresh enrollment status
  const checkEnrollment = useCallback(async () => {
    try {
      const result = await getEnrollmentStatus(courseId);
      setEnrolled(result.enrolled);
      setCompleted(result.completed);
      setFeedback(null);
    } catch (error) {
      console.error("Failed to check enrollment status:", error);
      setFeedback({ message: "Unable to load enrollment status.", isError: true });
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  // Initial check on mount
  useEffect(() => {
    void Promise.resolve().then(checkEnrollment);
  }, [checkEnrollment]);

  // Realtime updates scoped strictly to relevant database changes
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`enrollment-status-${courseId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lesson_progress",
          filter: `course_id=eq.${courseId}`,
        },
        () => checkEnrollment()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "course_sections" },
        () => checkEnrollment()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lessons" },
        () => checkEnrollment()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [courseId, checkEnrollment]);

  // Handle enrollment action
  async function handleEnroll() {
    if (enrolling) return;

    setEnrolling(true);
    setFeedback(null);

    try {
      const result = await enrollInCourse(courseId);

      if (!result.success) {
        setFeedback({
          message: result.error ?? "Unable to enroll in course.",
          isError: true,
        });
        return;
      }

      setEnrolled(true);
      setCompleted(false);
      setFeedback({
        message: result.alreadyEnrolled
          ? "You are already enrolled."
          : "Welcome! You are now enrolled.",
        isError: false,
      });

      router.refresh();
    } catch {
      setFeedback({
        message: "Something went wrong. Please try again.",
        isError: true,
      });
    } finally {
      setEnrolling(false);
    }
  }

  // 1. Loading State
  if (loading) {
    return (
      <div className="mt-6 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gray-100 font-medium text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin text-[#5624d0]" />
        <span>Checking status...</span>
      </div>
    );
  }

  // 2. Completed State
  if (enrolled && completed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 space-y-3"
      >
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-emerald-900">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-bold">Course Completed!</p>
            <p className="text-xs text-emerald-700">
              Great job! Feel free to review the materials anytime.
            </p>
          </div>
        </div>

        <Link
          href={`/courses/${courseSlug}/learn`}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl border-2 border-[#5624d0] font-bold text-[#5624d0] transition-all hover:bg-purple-50 active:scale-[0.99]"
        >
          Review Course
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    );
  }

  // 3. Enrolled / Learning State
  if (enrolled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 space-y-3"
      >
        <Link
          href={`/courses/${courseSlug}/learn`}
          className="group relative flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#5624d0] font-bold text-white shadow-md shadow-purple-500/20 transition-all hover:bg-[#451bb5] hover:shadow-lg hover:shadow-purple-500/30 active:scale-[0.99]"
        >
          <span>Continue Learning</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>

        <AnimatePresence mode="wait">
          {feedback ? (
            <motion.p
              key="feedback"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-center text-xs font-semibold ${
                feedback.isError ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {feedback.message}
            </motion.p>
          ) : (
            <p className="text-center text-xs text-gray-500">
              You are enrolled in this course.
            </p>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // 4. Default State (Not Enrolled)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 space-y-3"
    >
      <button
        type="button"
        onClick={handleEnroll}
        disabled={enrolling}
        className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#5624d0] font-bold text-white shadow-md shadow-purple-500/20 transition-all hover:bg-[#451bb5] hover:shadow-lg hover:shadow-purple-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {enrolling ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Enrolling...</span>
          </>
        ) : (
          <>
            <span>Enroll Now</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </>
        )}
      </button>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className={`flex items-center justify-center gap-2 rounded-lg p-3 text-xs font-medium ${
                feedback.isError
                  ? "border border-red-200 bg-red-50 text-red-700"
                  : "border border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {feedback.isError ? (
                <AlertCircle className="h-4 w-4 shrink-0" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}