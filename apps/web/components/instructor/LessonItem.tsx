"use client";

import {
  Check,
  Clock,
  FileVideo,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import {
  deleteLesson,
} from "@/app/instructor/courses/[id]/edit/lessons/actions";

import { LessonForm } from "./LessonForm";

type Lesson = {
  id: string;
  section_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_seconds: number;
  position: number;
  is_preview: boolean;
};

type LessonItemProps = {
  lesson: Lesson;
  courseId: string;
  refetch: () => Promise<unknown>;
};

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) {
    return "--:--";
  }

  const hours = Math.floor(seconds / 3600);

  const minutes = Math.floor(
    (seconds % 3600) / 60,
  );

  const remainingSeconds = Math.floor(
    seconds % 60,
  );

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(remainingSeconds).padStart(
      2,
      "0",
    )}`;
  }

  return `${String(minutes).padStart(
    2,
    "0",
  )}:${String(remainingSeconds).padStart(
    2,
    "0",
  )}`;
}

export function LessonItem({
  lesson,
  courseId,
  refetch,
}: LessonItemProps) {
  const [editing, setEditing] =
    useState(false);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  async function handleDelete() {
    if (deleting) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${lesson.title}"? This will also delete the lesson video.`,
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      await deleteLesson(
        lesson.id,
        lesson.section_id,
        courseId,
      );

      await refetch();
    } catch (error) {
      console.error(
        "Failed to delete lesson:",
        error,
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to delete lesson.",
      );
    } finally {
      setDeleting(false);
      setMenuOpen(false);
    }
  }

  if (editing) {
    return (
      <LessonForm
  sectionId={lesson.section_id}
  courseId={courseId}
  lessonId={lesson.id}
        initialTitle={lesson.title}
        initialDescription={
          lesson.description
        }
        initialVideoUrl={
          lesson.video_url
        }
        initialDuration={
          lesson.duration_seconds
        }
        initialPreview={
          lesson.is_preview
        }
        onCancel={() =>
          setEditing(false)
        }
        onSuccess={async () => {
          await refetch();
          setEditing(false);
        }}
      />
    );
  }

  return (
    <div
      className="
        group
        rounded-xl
        border
        border-gray-200
        bg-white
        px-4
        py-3
        transition
        hover:border-purple-200
        hover:shadow-sm
      "
    >
      <div className="flex items-center gap-3">
        {/* Lesson icon */}

        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-purple-50
            text-[#5624d0]
          "
        >
          <FileVideo className="h-4 w-4" />
        </div>

        {/* Lesson information */}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-bold text-gray-900">
              {lesson.title}
            </p>

            {lesson.is_preview && (
              <span
                className="
                  shrink-0
                  rounded-full
                  bg-green-50
                  px-2
                  py-0.5
                  text-[10px]
                  font-bold
                  text-green-700
                "
              >
                Preview
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
            {/* Duration */}

            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />

              {formatDuration(
                lesson.duration_seconds,
              )}{" "}
              video
            </span>

            {/* Video status */}

            {lesson.video_url ? (
              <span className="flex items-center gap-1 font-medium text-green-600">
                <Check className="h-3.5 w-3.5" />

                Video added
              </span>
            ) : (
              <span className="font-medium text-amber-600">
                Video missing
              </span>
            )}
          </div>

          {/* Description */}

          {lesson.description && (
            <p className="mt-1 truncate text-xs text-gray-400">
              {lesson.description}
            </p>
          )}
        </div>

        {/* Menu */}

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() =>
              setMenuOpen(
                (current) => !current,
              )
            }
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-gray-400
              transition
              hover:bg-gray-100
              hover:text-gray-700
            "
            aria-label="Lesson options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <>
              {/* Close menu */}

              <button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() =>
                  setMenuOpen(false)
                }
              />

              {/* Menu */}

              <div
                className="
                  absolute
                  right-0
                  top-10
                  z-20
                  w-40
                  overflow-hidden
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  p-1
                  shadow-xl
                "
              >
                {/* Edit */}

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setEditing(true);
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    gap-2
                    rounded-lg
                    px-3
                    py-2
                    text-left
                    text-sm
                    font-medium
                    text-gray-700
                    transition
                    hover:bg-gray-50
                  "
                >
                  <Pencil className="h-4 w-4" />

                  Edit lesson
                </button>

                {/* Delete */}

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="
                    flex
                    w-full
                    items-center
                    gap-2
                    rounded-lg
                    px-3
                    py-2
                    text-left
                    text-sm
                    font-medium
                    text-red-600
                    transition
                    hover:bg-red-50
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}

                  {deleting
                    ? "Deleting..."
                    : "Delete lesson"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}