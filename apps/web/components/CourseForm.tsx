"use client";

import {
  FormEvent,
  useState,
} from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";

import { courseSchema } from "@/lib/validations/course";

type CourseFormProps = {
  action: (
    formData: FormData,
  ) => void | Promise<void>;

  course?: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    category: string | null;
    level: string | null;
    price: number;
    thumbnail_url: string | null;
  };
};

export function CourseForm({
  action,
  course,
}: CourseFormProps) {
  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [imagePreview, setImagePreview] =
    useState(
      course?.thumbnail_url ?? "",
    );

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Thumbnail must be a JPG, PNG, or WebP image.",
      );

      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Thumbnail image must be smaller than 5 MB.",
      );

      event.target.value = "";
      return;
    }

    setError("");

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");

    const formData = new FormData(
      event.currentTarget,
    );

    const validation =
      courseSchema.safeParse({
        title: formData.get("title"),
        description:
          formData.get("description"),
        category:
          formData.get("category"),
        level: formData.get("level"),
        price: formData.get("price"),
      });

    if (!validation.success) {
      setError(
        validation.error.issues[0]?.message ??
          "Please check your course details.",
      );

      return;
    }

    setSubmitting(true);

    const startTime = Date.now();

    try {
      await action(formData);

      const elapsed =
        Date.now() - startTime;

      const remaining =
        700 - elapsed;

      if (remaining > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, remaining),
        );
      }
    } catch (error) {
      console.error(
        "Course form submission failed:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* COURSE ID */}

      {course && (
        <input
          type="hidden"
          name="course_id"
          value={course.id}
        />
      )}

      {/* ==========================================
          TITLE
      ========================================== */}

      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-bold"
        >
          Course title
        </label>

        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={
            course?.title ?? ""
          }
          placeholder="e.g. Complete Web Development"
          disabled={submitting}
          className="
            w-full
            border
            px-4
            py-3
            outline-none
            transition
            focus:border-[#5624d0]
            disabled:cursor-not-allowed
            disabled:bg-gray-100
          "
        />
      </div>

      {/* ==========================================
          DESCRIPTION
      ========================================== */}

      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-bold"
        >
          Description
        </label>

        <textarea
          id="description"
          name="description"
          rows={6}
          defaultValue={
            course?.description ?? ""
          }
          placeholder="Describe what students will learn..."
          disabled={submitting}
          className="
            w-full
            resize-y
            border
            px-4
            py-3
            outline-none
            transition
            focus:border-[#5624d0]
            disabled:cursor-not-allowed
            disabled:bg-gray-100
          "
        />
      </div>

      {/* ==========================================
          CATEGORY / LEVEL / PRICE
      ========================================== */}

      <div className="grid gap-6 md:grid-cols-3">
        {/* CATEGORY */}

        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-bold"
          >
            Category
          </label>

          <select
            id="category"
            name="category"
            required
            defaultValue={
              course?.category ?? ""
            }
            disabled={submitting}
            className="
              w-full
              border
              bg-white
              px-4
              py-3
              outline-none
              transition
              focus:border-[#5624d0]
              disabled:cursor-not-allowed
              disabled:bg-gray-100
            "
          >
            <option value="">
              Select category
            </option>

            <option value="Development">
              Development
            </option>

            <option value="Business">
              Business
            </option>

            <option value="Finance & Accounting">
              Finance & Accounting
            </option>

            <option value="IT & Software">
              IT & Software
            </option>

            <option value="Office Productivity">
              Office Productivity
            </option>

            <option value="Personal Development">
              Personal Development
            </option>

            <option value="Design">
              Design
            </option>

            <option value="Marketing">
              Marketing
            </option>

            <option value="Health & Fitness">
              Health & Fitness
            </option>
          </select>
        </div>

        {/* LEVEL */}

        <div>
          <label
            htmlFor="level"
            className="mb-2 block text-sm font-bold"
          >
            Level
          </label>

          <select
            id="level"
            name="level"
            required
            defaultValue={
              course?.level ?? ""
            }
            disabled={submitting}
            className="
              w-full
              border
              bg-white
              px-4
              py-3
              outline-none
              transition
              focus:border-[#5624d0]
              disabled:cursor-not-allowed
              disabled:bg-gray-100
            "
          >
            <option value="">
              Select level
            </option>

            <option value="beginner">
              Beginner
            </option>

            <option value="intermediate">
              Intermediate
            </option>

            <option value="advanced">
              Advanced
            </option>
          </select>
        </div>

        {/* PRICE */}

        <div>
          <label
            htmlFor="price"
            className="mb-2 block text-sm font-bold"
          >
            Price (₹)
          </label>

          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={
              course?.price ?? 0
            }
            disabled={submitting}
            className="
              w-full
              border
              px-4
              py-3
              outline-none
              transition
              focus:border-[#5624d0]
              disabled:cursor-not-allowed
              disabled:bg-gray-100
            "
          />
        </div>
      </div>

      {/* ==========================================
          THUMBNAIL
      ========================================== */}

      <div>
        <label
          htmlFor="thumbnail"
          className="mb-2 block text-sm font-bold"
        >
          Course thumbnail
        </label>

        <input
          id="thumbnail"
          name="thumbnail"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
          disabled={submitting}
          className="
            w-full
            border
            bg-white
            px-4
            py-3
            text-sm
            disabled:cursor-not-allowed
            disabled:bg-gray-100
          "
        />

        <p className="mt-2 text-xs text-gray-500">
          Upload a JPG, PNG, or WebP image.
          Maximum size: 5 MB.
        </p>

        {imagePreview && (
          <div className="mt-4 overflow-hidden border border-[#d1d7dc]">
            <Image
              src={imagePreview}
              alt="Course thumbnail preview"
              width={1200}
              height={600}
              className="h-48 w-full object-cover"
            />
          </div>
        )}
      </div>

      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (
        <div
          role="alert"
          className="
            border
            border-red-200
            bg-red-50
            p-3
            text-sm
            text-red-700
          "
        >
          {error}
        </div>
      )}

      {/* ==========================================
          SUBMIT
      ========================================== */}

      <button
        type="submit"
        disabled={submitting}
        className="
          inline-flex
          min-h-11
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-[#5624d0]
          px-6
          py-3
          text-sm
          font-bold
          text-white
          shadow-sm
          transition-all
          hover:-translate-y-0.5
          hover:bg-[#401b9b]
          hover:shadow-md
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />

            {course
              ? "Saving changes..."
              : "Creating course..."}
          </>
        ) : course ? (
          "Save changes"
        ) : (
          "Create course"
        )}
      </button>
    </form>
  );
}