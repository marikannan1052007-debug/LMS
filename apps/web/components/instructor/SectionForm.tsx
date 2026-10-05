"use client";

import { Loader2 } from "lucide-react";
import {
  FormEvent,
  useState,
} from "react";

import {
  createSection,
  updateSection,
} from "@/app/instructor/courses/[id]/edit/sections/actions";

type SectionFormProps = {
  courseId: string;
  sectionId?: string;
  initialTitle?: string;
  onCancel?: () => void;
  onSuccess?: (result: any) => void | Promise<void>;
};

export function SectionForm({
  courseId,
  sectionId,
  initialTitle = "",
  onCancel,
  onSuccess,
}: SectionFormProps) {
  const [title, setTitle] =
    useState(initialTitle);

  const [submitting, setSubmitting] =
    useState(false);

  const isEditing = Boolean(sectionId);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    /*
     * IMPORTANT:
     * This happens BEFORE the server action.
     * React will immediately render:
     * Adding... / Saving...
     */
    setSubmitting(true);

    const formData = new FormData(
      event.currentTarget,
    );

    try {
      const result = isEditing
        ? await updateSection(formData)
        : await createSection(formData);

      await onSuccess?.(result);
    } catch (error) {
      console.error(
        "Section action failed:",
        error,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:flex-row"
    >
      <input
        type="hidden"
        name="course_id"
        value={courseId}
      />

      {sectionId && (
        <input
          type="hidden"
          name="section_id"
          value={sectionId}
        />
      )}

      <input
        name="title"
        value={title}
        onChange={(event) =>
          setTitle(event.target.value)
        }
        placeholder="Section title"
        required
        autoFocus={isEditing}
        disabled={submitting}
        className="
          h-11
          min-w-0
          flex-1
          rounded-xl
          border
          border-gray-200
          bg-white
          px-4
          text-sm
          font-medium
          outline-none
          transition
          placeholder:text-gray-400
          focus:border-[#5624d0]
          focus:ring-4
          focus:ring-purple-100
          disabled:cursor-not-allowed
          disabled:bg-gray-100
        "
      />

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="
            inline-flex
            min-w-[120px]
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#5624d0]
            px-5
            py-2.5
            text-sm
            font-bold
            text-white
            shadow-sm
            transition
            hover:bg-[#401b9b]
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />

              {isEditing
                ? "Saving..."
                : "Adding..."}
            </>
          ) : (
            <>
              {isEditing
                ? "Save"
                : "Add section"}
            </>
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="
              rounded-xl
              border
              border-gray-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-bold
              text-gray-600
              transition
              hover:bg-gray-50
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}