"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  FileVideo,
  Loader2,
  PlayCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import { completeLesson } from "@/app/courses/[slug]/learn/actions";
import { getLessonVideoUrl } from "@/app/courses/[slug]/learn/video-action";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_seconds: number;
  is_preview: boolean;
};

type LessonPlayerProps = {
  lesson: Lesson;
  courseId: string;
  courseSlug: string;
  completed: boolean;
  nextLesson: Lesson | null;
  previousLesson: Lesson | null;
  progressPercent: number;
  isLastLesson: boolean;
};

export function LessonPlayer({
  lesson,
  courseId,
  courseSlug,
  completed,
  nextLesson,
  previousLesson,
  progressPercent,
  isLastLesson,
}: LessonPlayerProps) {
  const [videoUrl, setVideoUrl] =
    useState<string | null>(null);

  const [loadingVideo, setLoadingVideo] =
    useState(true);

  const [videoError, setVideoError] =
    useState("");

  const [completing, setCompleting] =
    useState(false);

  const [isCompleted, setIsCompleted] =
    useState(completed);

  const [completionError, setCompletionError] =
    useState("");

  const durationMinutes = Math.max(
    1,
    Math.round(
      lesson.duration_seconds / 60,
    ),
  );

  // ==================================================
  // LOAD SIGNED VIDEO URL
  // ==================================================

  useEffect(() => {
    let cancelled = false;

    async function loadVideo() {
      setLoadingVideo(true);
      setVideoError("");
      setVideoUrl(null);

      if (!lesson.video_url) {
        setLoadingVideo(false);
        return;
      }

      try {
        const result =
          await getLessonVideoUrl(
            lesson.id,
            courseId,
          );

        if (!cancelled) {
          setVideoUrl(
            result.signedUrl,
          );
        }
      } catch (error) {
        if (!cancelled) {
          setVideoError(
            error instanceof Error
              ? error.message
              : "Unable to load lesson video.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingVideo(false);
        }
      }
    }

    loadVideo();

    return () => {
      cancelled = true;
    };
  }, [
    lesson.id,
    lesson.video_url,
    courseId,
  ]);

  // ==================================================
  // SYNC COMPLETION STATE
  // ==================================================

  // ==================================================
  // AUTOMATIC VIDEO COMPLETION
  // ==================================================

  async function handleVideoEnded(
    event: React.SyntheticEvent<HTMLVideoElement>,
  ) {
    const video =
      event.currentTarget;

    /*
     * Make sure the browser actually
     * has a valid video duration.
     */
    if (
      !Number.isFinite(
        video.duration,
      ) ||
      video.duration <= 0
    ) {
      return;
    }

    /*
     * Prevent duplicate requests.
     */
    if (
      completing ||
      isCompleted
    ) {
      return;
    }

    setCompleting(true);
    setCompletionError("");

    try {
      await completeLesson(
        lesson.id,
        courseId,
      );

      /*
       * Update the UI immediately.
       */
      setIsCompleted(true);
    } catch (error) {
      console.error(
        "Failed to complete lesson:",
        error,
      );

      setCompletionError(
        error instanceof Error
          ? error.message
          : "Unable to mark lesson as complete.",
      );
    } finally {
      setCompleting(false);
    }
  }

  // ==================================================
  // NAVIGATION
  // ==================================================

  function getLessonUrl(
    targetLesson: Lesson,
  ) {
    return `/courses/${courseSlug}/learn?lesson=${targetLesson.id}`;
  }

  return (
    <div className="flex flex-col">
      {/* ==================================================
          LESSON HEADER
      ================================================== */}

      <div
        className="
          border-b
          border-gray-100
          px-6
          py-6
          sm:px-10
        "
      >
        <div className="flex items-start gap-4">
          {/* Lesson icon */}

          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-purple-100
              text-[#5624d0]
            "
          >
            <PlayCircle className="h-5 w-5" />
          </div>

          {/* Lesson information */}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight text-gray-950">
                {lesson.title}
              </h2>

              {lesson.is_preview && (
                <span
                  className="
                    rounded-full
                    bg-green-50
                    px-2.5
                    py-1
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-green-700
                  "
                >
                  Preview
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-gray-500">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />

                {durationMinutes} min video
              </span>

              {isCompleted && (
                <span className="flex items-center gap-1.5 font-semibold text-green-600">
                  <Check className="h-3.5 w-3.5" />

                  Completed
                </span>
              )}

              {completing && (
                <span className="flex items-center gap-1.5 font-semibold text-purple-600">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />

                  Saving completion...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          VIDEO PLAYER
      ================================================== */}

      <div className="px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-5xl">
          {/* Loading */}

          {loadingVideo && (
            <div
              className="
                flex
                aspect-video
                items-center
                justify-center
                overflow-hidden
                rounded-2xl
                bg-gray-950
                shadow-xl
              "
            >
              <div className="flex flex-col items-center gap-3 text-white">
                <Loader2 className="h-8 w-8 animate-spin" />

                <span className="text-sm font-semibold">
                  Loading video...
                </span>
              </div>
            </div>
          )}

          {/* Error */}

          {!loadingVideo &&
            videoError && (
              <div
                className="
                  rounded-2xl
                  border
                  border-red-200
                  bg-red-50
                  px-6
                  py-12
                  text-center
                "
              >
                <FileVideo
                  className="
                    mx-auto
                    h-10
                    w-10
                    text-red-400
                  "
                />

                <p className="mt-4 font-bold text-red-800">
                  Unable to load lesson video
                </p>

                <p className="mt-2 text-sm text-red-600">
                  {videoError}
                </p>
              </div>
            )}

          {/* Video */}

          {!loadingVideo &&
            !videoError &&
            videoUrl && (
              <div
                className="
                  overflow-hidden
                  rounded-2xl
                  bg-black
                  shadow-2xl
                  ring-1
                  ring-black/10
                "
              >
                <video
                  key={videoUrl}
                  src={videoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  onEnded={handleVideoEnded}
                  className="
                    aspect-video
                    h-auto
                    w-full
                    bg-black
                  "
                >
                  Your browser does not support
                  video playback.
                </video>
              </div>
            )}

          {/* No video */}

          {!loadingVideo &&
            !videoError &&
            !videoUrl && (
              <div
                className="
                  rounded-2xl
                  border
                  border-dashed
                  border-gray-200
                  bg-gray-50
                  px-6
                  py-12
                  text-center
                "
              >
                <FileVideo
                  className="
                    mx-auto
                    h-10
                    w-10
                    text-gray-400
                  "
                />

                <p className="mt-4 font-bold text-gray-700">
                  Video coming soon
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  This lesson does not have a
                  video yet.
                </p>
              </div>
            )}
        </div>
      </div>

      {/* ==================================================
          LESSON DESCRIPTION
      ================================================== */}

      {lesson.description && (
        <div
          className="
            border-t
            border-gray-100
            px-6
            py-6
            sm:px-10
          "
        >
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-gray-400
            "
          >
            About this lesson
          </p>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-600">
            {lesson.description}
          </p>
        </div>
      )}

      {/* ==================================================
          AUTOMATIC COMPLETION STATUS
      ================================================== */}

      <div
        className="
          border-t
          border-gray-100
          bg-gray-50/60
          px-6
          py-6
          sm:px-10
        "
      >
        {isCompleted ? (
          <div
            className="
              flex
              items-center
              gap-4
              rounded-2xl
              border
              border-green-200
              bg-green-50
              px-5
              py-4
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-green-100
                text-green-700
              "
            >
              <Check className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-bold text-green-800">
                Lesson completed
              </p>

              <p className="mt-1 text-xs text-green-700">
                Your course progress is{" "}
                {progressPercent}%.
              </p>
            </div>
          </div>
        ) : completing ? (
          <div
            className="
              flex
              items-center
              gap-4
              rounded-2xl
              border
              border-purple-200
              bg-purple-50
              px-5
              py-4
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-purple-100
                text-[#5624d0]
              "
            >
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>

            <div>
              <p className="text-sm font-bold text-[#5624d0]">
                Saving completion...
              </p>

              <p className="mt-1 text-xs text-purple-600">
                Updating your course progress.
              </p>
            </div>
          </div>
        ) : (
          <div
            className="
              flex
              items-center
              gap-4
              rounded-2xl
              border
              border-gray-200
              bg-white
              px-5
              py-4
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-gray-100
                text-gray-500
              "
            >
              <PlayCircle className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-bold text-gray-800">
                Watch the complete video
              </p>

              <p className="mt-1 text-xs text-gray-500">
                This lesson will automatically be
                marked as completed when the video
                finishes.
              </p>
            </div>
          </div>
        )}

        {/* Completion error */}

        {completionError && (
          <div
            className="
              mt-4
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              font-medium
              text-red-700
            "
          >
            {completionError}
          </div>
        )}
      </div>

      {/* ==================================================
          PREVIOUS / NEXT LESSON
      ================================================== */}

      <div
        className="
          flex
          flex-col
          gap-3
          border-t
          border-gray-100
          px-6
          py-6
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-10
        "
      >
        {/* Previous */}

        {previousLesson ? (
          <Link
            href={getLessonUrl(previousLesson)}
            scroll={false}
            className="
              group
              flex
              min-w-0
              items-center
              gap-3
              rounded-xl
              border
              border-gray-200
              bg-white
              px-4
              py-3
              transition
              hover:border-purple-200
              hover:bg-purple-50/40
            "
          >
            <ArrowLeft
              className="
                h-4
                w-4
                shrink-0
                text-gray-400
                transition
                group-hover:-translate-x-1
                group-hover:text-[#5624d0]
              "
            />

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Previous
              </p>

              <p className="mt-0.5 max-w-[220px] truncate text-sm font-bold text-gray-800">
                {previousLesson.title}
              </p>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {/* Next */}

        {nextLesson ? (
          <Link
            href={getLessonUrl(nextLesson)}
            scroll={false}
            className="
              group
              flex
              min-w-0
              items-center
              gap-3
              rounded-xl
              border
              border-purple-100
              bg-purple-50/40
              px-4
              py-3
              text-right
              transition
              hover:border-purple-200
              hover:bg-purple-50
            "
          >
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5624d0]/60">
                Next lesson
              </p>

              <p className="mt-0.5 max-w-[220px] truncate text-sm font-bold text-[#5624d0]">
                {nextLesson.title}
              </p>
            </div>

            <ArrowRight
              className="
                h-4
                w-4
                shrink-0
                text-[#5624d0]
                transition
                group-hover:translate-x-1
              "
            />
          </Link>
        ) : (
          <div className="text-right">
            {isLastLesson && (
              <p className="text-xs font-bold text-green-600">
                You reached the final lesson.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}