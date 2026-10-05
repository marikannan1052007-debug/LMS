"use client";

import { useEffect, useState } from "react";
import { Plus, BookOpen } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useCourseContent } from "@/hooks/useCourseContent";

import { CourseSection } from "./CourseSection";
import { SectionForm } from "./SectionForm";

import { Header } from "@/components/Header";


type SectionManagerProps = {
  courseId: string;
};

export function SectionManager({
  courseId,
}: SectionManagerProps) {
  const {
    data: sections = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCourseContent(courseId);

  const [addingSection, setAddingSection] =
    useState(false);

  /*
   * REALTIME
   */
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`course-content-${courseId}`)

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "course_sections",
          filter: `course_id=eq.${courseId}`,
        },
        () => {
          refetch();
        },
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lessons",
        },
        () => {
          refetch();
        },
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [courseId, refetch]);

  /*
   * LOADING
   */
  if (isLoading) {
    return (
      <section
        className="
          mt-8
          rounded-3xl
          border
          border-gray-200
          bg-white
          p-6
          shadow-sm
        "
      >
        <div className="animate-pulse space-y-5">
          <div className="h-7 w-48 rounded-lg bg-gray-200" />

          <div className="h-16 rounded-2xl bg-gray-100" />

          <div className="h-28 rounded-2xl bg-gray-100" />

          <div className="h-28 rounded-2xl bg-gray-100" />
        </div>
      </section>
    );
  }

  /*
   * ERROR
   */
  if (isError) {
    return (
      <section
        className="
          mt-8
          rounded-3xl
          border
          border-red-200
          bg-red-50
          p-6
        "
      >
        <h2 className="text-lg font-black text-red-900">
          Unable to load course content
        </h2>

        <p className="mt-2 text-sm leading-6 text-red-700">
          {error instanceof Error
            ? error.message
            : "Something went wrong while loading sections and lessons."}
        </p>
      </section>
    );
  }

  return (
    <section
      className="
        relative
        mt-8
        overflow-visible
        rounded-3xl
        border
        border-gray-200/80
        bg-white
        shadow-xl
        shadow-gray-200/30
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-52
          w-52
          rounded-full
          bg-purple-300/10
          blur-3xl
        "
      />

      {/* HEADER */}

      <div
        className="
          relative
          flex
          flex-col
          gap-5
          border-b
          border-gray-100
          p-6
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:p-7
        "
      >
        <div>
          <h2
            className="
              text-xl
              font-black
              tracking-tight
              text-gray-950
              sm:text-2xl
            "
          >
            Course content
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Build your course with sections and
            lessons.
          </p>
        </div>

        {!addingSection && (
          <button
            type="button"
            onClick={() =>
              setAddingSection(true)
            }
            className="
              inline-flex
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
              shadow-lg
              shadow-purple-200
              transition-all
              hover:-translate-y-0.5
              hover:bg-[#401b9b]
              hover:shadow-xl
            "
          >
            <Plus className="h-4 w-4" />

            Add section
          </button>
        )}
      </div>

      {/* ADD SECTION FORM */}

      {addingSection && (
        <div
          className="
            border-b
            border-gray-100
            bg-gray-50/50
            p-5
            sm:p-6
          "
        >
          <SectionForm
            courseId={courseId}
            onCancel={() =>
              setAddingSection(false)
            }
            onSuccess={async () => {
              await refetch();
              setAddingSection(false);
            }}
          />
        </div>
      )}

      {/* SECTIONS */}

      <div className="relative p-4 sm:p-6">
        {sections.length === 0 ? (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-gray-200
              bg-gray-50/50
              px-6
              py-12
              text-center
            "
          >
            <div
              className="
                mx-auto
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-white
                text-gray-400
                shadow-sm
                ring-1
                ring-gray-100
              "
            >
              <BookOpen className="h-5 w-5" />
            </div>

            <p className="mt-4 font-bold text-gray-800">
              Your course is empty
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Add your first section to start
              building.
            </p>

            {!addingSection && (
              <button
                type="button"
                onClick={() =>
                  setAddingSection(true)
                }
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-[#5624d0]
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-[#401b9b]
                "
              >
                <Plus className="h-4 w-4" />

                Create first section
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map(
              (section, sectionIndex) => (
                <CourseSection
                  key={section.id}
                  section={
                    section as unknown as React.ComponentProps<
                      typeof CourseSection
                    >["section"]
                  }
                  sectionIndex={sectionIndex}
                  courseId={courseId}
                  refetch={refetch}
                />
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
}