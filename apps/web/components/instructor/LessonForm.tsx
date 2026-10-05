"use client";

import {
  Check,
  FileVideo,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useRef, useState } from "react";

import {
  createLesson,
  updateLesson,
} from "@/app/instructor/courses/[id]/edit/lessons/actions";
import { createClient } from "@/lib/supabase/client";

type LessonFormProps = {
  sectionId: string;
  courseId: string;
  lessonId?: string;

  initialTitle?: string;
  initialDescription?: string | null;
  initialVideoUrl?: string | null;
  initialDuration?: number;
  initialPreview?: boolean;

  onCancel: () => void;
  onSuccess: () => Promise<void> | void;
};

const MAX_VIDEO_SIZE = 500 * 1024 * 1024;

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const VIDEO_EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) {
    return "00:00";
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

export function LessonForm({
  sectionId,
  courseId,
  lessonId,
  initialTitle = "",
  initialDescription = "",
  initialVideoUrl = null,
  initialDuration = 0,
  initialPreview = false,
  onCancel,
  onSuccess,
}: LessonFormProps) {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [title, setTitle] =
    useState(initialTitle);

  const [description, setDescription] =
    useState(initialDescription ?? "");

  const [position, setPosition] =
    useState(0);

  const [durationSeconds, setDurationSeconds] =
    useState(initialDuration);

  const [isPreview, setIsPreview] =
    useState(initialPreview);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [calculatingDuration, setCalculatingDuration] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const isEditing = Boolean(lessonId);

  function handleVideoChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    if (
      !ALLOWED_VIDEO_TYPES.includes(
        file.type,
      )
    ) {
      setSelectedFile(null);
      setDurationSeconds(0);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setError(
        "Only MP4, WebM, and MOV videos are allowed.",
      );

      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      setSelectedFile(null);
      setDurationSeconds(0);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setError(
        "Video size must be 500MB or less.",
      );

      return;
    }

    setSelectedFile(file);
    setCalculatingDuration(true);

    const video =
      document.createElement("video");

    const objectUrl =
      URL.createObjectURL(file);

    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const duration = Number(
        video.duration,
      );

      if (
        !Number.isFinite(duration) ||
        duration <= 0
      ) {
        setDurationSeconds(0);

        setError(
          "Unable to determine video duration.",
        );
      } else {
        setDurationSeconds(
          Math.round(duration),
        );
      }

      setCalculatingDuration(false);

      URL.revokeObjectURL(objectUrl);
    };

    video.onerror = () => {
      setDurationSeconds(0);
      setCalculatingDuration(false);

      URL.revokeObjectURL(objectUrl);

      setError(
        "Unable to read the selected video.",
      );
    };

    video.src = objectUrl;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");
    setSuccess("");

    if (!sectionId) {
      setError(
        "Section ID is missing. Please close this form and try again.",
      );
      return;
    }

    if (!courseId) {
      setError(
        "Course ID is missing. Please close this form and try again.",
      );
      return;
    }

    if (!title.trim()) {
      setError(
        "Please enter a lesson title.",
      );
      return;
    }

    if (title.trim().length < 2) {
      setError(
        "Lesson title must be at least 2 characters.",
      );
      return;
    }

    if (
      !isEditing &&
      !selectedFile
    ) {
      setError(
        "Please select a video.",
      );
      return;
    }

    if (
      selectedFile &&
      calculatingDuration
    ) {
      setError(
        "Please wait while the video duration is calculated.",
      );
      return;
    }

    if (
      !isEditing &&
      durationSeconds <= 0
    ) {
      setError(
        "Unable to determine the video duration.",
      );
      return;
    }

    setSubmitting(true);
    let uploadedVideoPath: string | null = null;

    try {
      if (selectedFile) {
        const supabase = createClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw new Error(userError.message);
        }

        if (!user) {
          throw new Error("You must be logged in to upload a video.");
        }

        const extension =
          VIDEO_EXTENSIONS[selectedFile.type];

        if (!extension) {
          throw new Error(
            "Unable to determine video file extension.",
          );
        }

        const videoPath = `${user.id}/${courseId}/${crypto.randomUUID()}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("course-videos")
          .upload(videoPath, selectedFile, {
            contentType: selectedFile.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Video upload failed: ${uploadError.message}`);
        }

        uploadedVideoPath = videoPath;
      }

      const formData =
        new FormData();

      /*
       * IMPORTANT:
       *
       * These two values were missing
       * from the previous implementation.
       */
      formData.set(
        "sectionId",
        sectionId,
      );

      formData.set(
        "courseId",
        courseId,
      );

      formData.set(
        "title",
        title.trim(),
      );

      formData.set(
        "description",
        description.trim(),
      );

      formData.set(
        "position",
        String(position),
      );

      formData.set(
        "durationSeconds",
        String(durationSeconds),
      );

      formData.set(
        "isPreview",
        String(isPreview),
      );

      if (uploadedVideoPath) {
        formData.set(
          "videoPath",
          uploadedVideoPath,
        );
      }

      if (lessonId) {
        formData.set(
          "lessonId",
          lessonId,
        );
      }

      const result = lessonId
        ? await updateLesson(formData)
        : await createLesson(formData);

      if (!result?.success) {
        throw new Error(
          "error" in result
            ? result.error
            : "Unable to save lesson.",
        );
      }

      uploadedVideoPath = null;

      setSuccess(
        lessonId
          ? "Lesson updated successfully."
          : "Lesson created successfully.",
      );

      await onSuccess();
    } catch (error) {
      console.error(
        "Failed to save lesson:",
        error,
      );

      let errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to save lesson.";

      if (uploadedVideoPath) {
        try {
          const { error: cleanupError } = await createClient()
            .storage
            .from("course-videos")
            .remove([uploadedVideoPath]);

          if (cleanupError) {
            console.error(
              "Failed to clean up uploaded video:",
              cleanupError,
            );
            errorMessage += " The uploaded video could not be cleaned up.";
          }
        } catch (cleanupError) {
          console.error(
            "Failed to clean up uploaded video:",
            cleanupError,
          );
          errorMessage += " The uploaded video could not be cleaned up.";
        }
      }

      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-5
        shadow-sm
      "
    >
      {/* Header */}

      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            {isEditing
              ? "Edit lesson"
              : "Add lesson"}
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Add a video lesson to this section.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            text-gray-400
            transition
            hover:bg-gray-100
            hover:text-gray-700
            disabled:opacity-50
          "
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Error */}

      {error && (
        <div
          className="
            mb-4
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
          {error}
        </div>
      )}

      {/* Success */}

      {success && (
        <div
          className="
            mb-4
            rounded-xl
            border
            border-green-200
            bg-green-50
            px-4
            py-3
            text-sm
            font-medium
            text-green-700
          "
        >
          {success}
        </div>
      )}

      {/* Title */}

      <div className="mb-4">
        <label
          htmlFor="lesson-title"
          className="
            mb-2
            block
            text-sm
            font-semibold
            text-gray-800
          "
        >
          Lesson title
        </label>

        <input
          id="lesson-title"
          type="text"
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          placeholder="e.g. Introduction to SQL"
          maxLength={150}
          disabled={submitting}
          className="
            w-full
            rounded-xl
            border
            border-gray-200
            bg-white
            px-4
            py-3
            text-sm
            text-gray-900
            outline-none
            transition
            placeholder:text-gray-400
            focus:border-purple-500
            focus:ring-2
            focus:ring-purple-100
            disabled:bg-gray-50
          "
        />

        <p className="mt-1 text-right text-xs text-gray-400">
          {title.length}/150
        </p>
      </div>

      {/* Description */}

      <div className="mb-4">
        <label
          htmlFor="lesson-description"
          className="
            mb-2
            block
            text-sm
            font-semibold
            text-gray-800
          "
        >
          Description
        </label>

        <textarea
          id="lesson-description"
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value,
            )
          }
          placeholder="Describe what students will learn..."
          maxLength={5000}
          rows={4}
          disabled={submitting}
          className="
            w-full
            resize-none
            rounded-xl
            border
            border-gray-200
            bg-white
            px-4
            py-3
            text-sm
            text-gray-900
            outline-none
            transition
            placeholder:text-gray-400
            focus:border-purple-500
            focus:ring-2
            focus:ring-purple-100
            disabled:bg-gray-50
          "
        />

        <p className="mt-1 text-right text-xs text-gray-400">
          {description.length}/5000
        </p>
      </div>

      {/* Video */}

      <div className="mb-5">
        <label
          htmlFor="lesson-video"
          className="
            mb-2
            block
            text-sm
            font-semibold
            text-gray-800
          "
        >
          {isEditing
            ? "Replace video"
            : "Lesson video"}
        </label>

        <input
          ref={fileInputRef}
          id="lesson-video"
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={handleVideoChange}
          disabled={submitting}
          className="hidden"
        />

        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          disabled={submitting}
          className="
            flex
            min-h-32
            w-full
            flex-col
            items-center
            justify-center
            rounded-2xl
            border-2
            border-dashed
            border-gray-200
            bg-gray-50
            px-6
            py-6
            text-center
            transition
            hover:border-purple-300
            hover:bg-purple-50
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {selectedFile ? (
            <>
              <div
                className="
                  mb-3
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-purple-100
                  text-purple-700
                "
              >
                <FileVideo className="h-5 w-5" />
              </div>

              <p className="max-w-full truncate text-sm font-bold text-gray-900">
                {selectedFile.name}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {(
                  selectedFile.size /
                  (1024 * 1024)
                ).toFixed(1)}{" "}
                MB
              </p>
            </>
          ) : (
            <>
              <div
                className="
                  mb-3
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-gray-100
                  text-gray-500
                "
              >
                <Upload className="h-5 w-5" />
              </div>

              <p className="text-sm font-bold text-gray-800">
                {isEditing
                  ? "Click to replace video"
                  : "Click to upload video"}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                MP4, WebM, or MOV · Maximum
                500MB
              </p>
            </>
          )}
        </button>

        {/* Existing video */}

        {isEditing &&
          initialVideoUrl &&
          !selectedFile && (
            <div className="mt-3 rounded-xl bg-green-50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                <Check className="h-4 w-4" />
                Existing video will be kept
              </div>
            </div>
          )}
      </div>

      {/* Duration */}

      <div className="mb-5">
        <label
          className="
            mb-2
            block
            text-sm
            font-semibold
            text-gray-800
          "
        >
          Video duration
        </label>

        <div
          className="
            flex
            items-center
            justify-between
            rounded-xl
            border
            border-gray-200
            bg-gray-50
            px-4
            py-3
          "
        >
          <span className="text-sm text-gray-500">
            Automatically detected
          </span>

          {calculatingDuration ? (
            <span className="flex items-center gap-2 text-sm font-semibold text-purple-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculating...
            </span>
          ) : (
            <span className="font-mono text-sm font-bold text-gray-900">
              {formatDuration(
                durationSeconds,
              )}
            </span>
          )}
        </div>
      </div>

      {/* Preview */}

      <div className="mb-5">
        <label
          className="
            flex
            cursor-pointer
            items-center
            gap-3
            rounded-xl
            border
            border-gray-200
            bg-gray-50
            px-4
            py-3
          "
        >
          <input
            type="checkbox"
            checked={isPreview}
            onChange={(event) =>
              setIsPreview(
                event.target.checked,
              )
            }
            disabled={submitting}
            className="
              h-4
              w-4
              rounded
              border-gray-300
              text-purple-600
              focus:ring-purple-500
            "
          />

          <div>
            <p className="text-sm font-semibold text-gray-800">
              Allow preview
            </p>

            <p className="text-xs text-gray-500">
              Students can watch this lesson
              before enrolling.
            </p>
          </div>
        </label>
      </div>

      {/* Hidden values */}

      <input
        type="hidden"
        name="sectionId"
        value={sectionId}
      />

      <input
        type="hidden"
        name="courseId"
        value={courseId}
      />

      <input
        type="hidden"
        name="position"
        value={position}
      />

      <input
        type="hidden"
        name="durationSeconds"
        value={durationSeconds}
      />

      <input
        type="hidden"
        name="isPreview"
        value={String(isPreview)}
      />

      {/* Buttons */}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="
            rounded-xl
            border
            border-gray-200
            px-4
            py-2.5
            text-sm
            font-semibold
            text-gray-700
            transition
            hover:bg-gray-50
            disabled:opacity-50
          "
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            submitting ||
            calculatingDuration
          }
          className="
            flex
            items-center
            gap-2
            rounded-xl
            bg-[#5624d0]
            px-5
            py-2.5
            text-sm
            font-bold
            text-white
            transition
            hover:bg-[#4b1fb8]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {submitting && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}

          {submitting
            ? "Saving..."
            : isEditing
              ? "Update lesson"
              : "Create lesson"}
        </button>
      </div>
    </form>
  );
}