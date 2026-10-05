"use client";

import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import {
  deleteSection,
  updateSection,
} from "@/app/instructor/courses/[id]/edit/sections/actions";

import { LessonForm } from "./LessonForm";
import { LessonItem } from "./LessonItem";

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

type Section = {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
};

type CourseSectionProps = {
  section: Section;
  sectionIndex: number;
  courseId: string;
  refetch: () => Promise<unknown>;
};

export function CourseSection({
  section,
  sectionIndex,
  courseId,
  refetch,
}: CourseSectionProps) {
  const [expanded, setExpanded] =
    useState(true);

  const [editing, setEditing] =
    useState(false);

  const [addingLesson, setAddingLesson] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [title, setTitle] =
    useState(section.title);

  async function handleUpdateSection() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    if (saving) {
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append(
        "section_id",
        section.id,
      );

      formData.append(
        "course_id",
        courseId,
      );

      formData.append(
        "title",
        trimmedTitle,
      );

      await updateSection(formData);

      await refetch();

      setEditing(false);
    } catch (error) {
      console.error(
        "Failed to update section:",
        error,
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to update section.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSection() {
    if (deleting) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${section.title}"? All lessons inside this section will also be deleted.`,
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      const formData = new FormData();

      formData.append(
        "section_id",
        section.id,
      );

      formData.append(
        "course_id",
        courseId,
      );

      await deleteSection(formData);

      await refetch();
    } catch (error) {
      console.error(
        "Failed to delete section:",
        error,
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to delete section.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-sm
      "
    >
      {/* ==================================================
          SECTION HEADER
      ================================================== */}

      <div
        className="
          flex
          items-center
          gap-3
          border-b
          border-gray-100
          bg-gradient-to-r
          from-gray-50
          to-white
          px-5
          py-4
        "
      >
        {/* Drag handle */}

        <div
          className="
            hidden
            cursor-grab
            text-gray-300
            sm:block
          "
          title="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </div>

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
            bg-purple-100
            text-sm
            font-black
            text-[#5624d0]
          "
        >
          {sectionIndex + 1}
        </div>

        {/* Section title */}

        {editing ? (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <input
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter"
                ) {
                  event.preventDefault();
                  handleUpdateSection();
                }

                if (
                  event.key === "Escape"
                ) {
                  setTitle(section.title);
                  setEditing(false);
                }
              }}
              autoFocus
              disabled={saving}
              className="
                min-w-0
                flex-1
                rounded-lg
                border
                border-purple-200
                bg-white
                px-3
                py-2
                text-sm
                font-semibold
                text-gray-900
                outline-none
                ring-0
                focus:border-[#5624d0]
              "
            />

            <button
              type="button"
              onClick={handleUpdateSection}
              disabled={
                saving ||
                !title.trim()
              }
              className="
                rounded-lg
                bg-[#5624d0]
                px-3
                py-2
                text-xs
                font-bold
                text-white
                transition
                hover:bg-[#451bb0]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving
                ? "Saving..."
                : "Save"}
            </button>

            <button
              type="button"
              onClick={() => {
                setTitle(section.title);
                setEditing(false);
              }}
              disabled={saving}
              className="
                rounded-lg
                border
                border-gray-200
                px-3
                py-2
                text-xs
                font-bold
                text-gray-600
                transition
                hover:bg-gray-50
              "
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-black text-gray-900">
              {section.title}
            </h3>

            <p className="mt-0.5 text-xs text-gray-400">
              {section.lessons.length}{" "}
              {section.lessons.length === 1
                ? "lesson"
                : "lessons"}
            </p>
          </div>
        )}

        {/* Actions */}

        {!editing && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                setEditing(true)
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
              aria-label="Edit section"
              title="Edit section"
            >
              <Pencil className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={
                handleDeleteSection
              }
              disabled={deleting}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                text-gray-400
                transition
                hover:bg-red-50
                hover:text-red-600
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              aria-label="Delete section"
              title="Delete section"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() =>
                setExpanded(
                  (current) =>
                    !current,
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
              aria-label={
                expanded
                  ? "Collapse section"
                  : "Expand section"
              }
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* ==================================================
          SECTION CONTENT
      ================================================== */}

      {expanded && (
        <div className="p-5">
          {/* Lessons */}

          {section.lessons.length > 0 ? (
            <div className="space-y-3">
              {section.lessons.map(
                (lesson) => (
                  <LessonItem
  key={lesson.id}
  lesson={lesson}
  courseId={courseId}
  refetch={refetch}
/>
                ),
              )}
            </div>
          ) : (
            <div
              className="
                rounded-xl
                border
                border-dashed
                border-gray-200
                bg-gray-50
                px-5
                py-8
                text-center
              "
            >
              <div
                className="
                  mx-auto
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-gray-100
                  text-gray-400
                "
              >
                <BookOpen className="h-5 w-5" />
              </div>

              <p className="mt-3 text-sm font-bold text-gray-700">
                No lessons yet
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Add a video lesson to this
                section.
              </p>
            </div>
          )}

          {/* ==================================================
              ADD LESSON
          ================================================== */}

          {addingLesson ? (
            <div className="mt-4">
              <LessonForm
  sectionId={section.id}
  courseId={courseId}
  onCancel={() =>
    setAddingLesson(false)
  }
  onSuccess={async () => {
    await refetch();
    setAddingLesson(false);
  }}
/>
            </div>
          ) : (
            <button
              type="button"
              onClick={() =>
                setAddingLesson(true)
              }
              className="
                mt-4
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-dashed
                border-purple-200
                bg-purple-50/50
                px-4
                py-3
                text-sm
                font-bold
                text-[#5624d0]
                transition
                hover:border-purple-300
                hover:bg-purple-50
              "
            >
              <Plus className="h-4 w-4" />

              Add video lesson
            </button>
          )}
        </div>
      )}
    </div>
  );
}