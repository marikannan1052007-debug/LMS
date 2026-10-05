"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import Image from "next/image";
type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  category: string | null;
  level: string | null;
  price: number;
  published: boolean;
  instructor_id: string;
};

type CourseCardProps = {
  course: Course;
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <article
      className="
        group
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-purple-200
        hover:shadow-xl
        hover:shadow-purple-100/50
      "
    >
      {/* =====================================================
          THUMBNAIL
      ===================================================== */}

      <Link
        href={`/courses/${course.slug}`}
        className="
          relative
          block
          h-48
          shrink-0
          overflow-hidden
          bg-gradient-to-br
          from-purple-100
          via-indigo-50
          to-gray-100
        "
      >
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-105
            "
          />
        ) : (
          <div
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              bg-gradient-to-br
              from-purple-100
              to-indigo-100
            "
          >
            <BookOpen
              className="
                h-12
                w-12
                text-purple-300
              "
            />
          </div>
        )}

        {/* Category */}
        {course.category && (
          <span
            className="
              absolute
              left-4
              top-4
              rounded-full
              bg-white/90
              px-3
              py-1.5
              text-[11px]
              font-bold
              text-gray-700
              shadow-sm
              backdrop-blur
            "
          >
            {course.category}
          </span>
        )}
      </Link>

      {/* =====================================================
          CARD BODY
      ===================================================== */}

      <div
        className="
          flex
          flex-1
          flex-col
          p-5
        "
      >
        {/* Level */}
        {course.level && (
          <div className="mb-3">
            <span
              className="
                text-[11px]
                font-bold
                uppercase
                tracking-wider
                text-purple-600
              "
            >
              {course.level}
            </span>
          </div>
        )}

        {/* ===================================================
            TITLE
        =================================================== */}

        <Link href={`/courses/${course.slug}`}>
          <h3
            className="
              min-h-[3.5rem]
              line-clamp-2
              text-lg
              font-black
              leading-7
              tracking-tight
              text-gray-900
              transition-colors
              group-hover:text-[#5624d0]
            "
          >
            {course.title}
          </h3>
        </Link>

        {/* ===================================================
            DESCRIPTION
        =================================================== */}

        <p
          className="
            mt-3
            min-h-[4.5rem]
            line-clamp-3
            text-sm
            leading-6
            text-gray-500
          "
        >
          {course.description ||
            "Explore this course and build practical skills through structured learning."}
        </p>

        {/* ===================================================
            META
        =================================================== */}

        <div
          className="
            mt-4
            flex
            min-h-[24px]
            items-center
            gap-4
            text-xs
            font-medium
            text-gray-400
          "
        >
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Course
          </span>

          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Self paced
          </span>
        </div>

        {/* ===================================================
            BOTTOM AREA
        =================================================== */}

        <div
          className="
            mt-auto
            flex
            items-end
            justify-between
            gap-4
            border-t
            border-gray-100
            pt-5
          "
        >
          {/* Price */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Price
            </p>

            <p className="mt-1 text-xl font-black text-gray-900">
              {course.price === 0
                ? "Free"
                : `₹${course.price}`}
            </p>
          </div>

          {/* Button */}
          <Link
            href={`/courses/${course.slug}`}
            className="
              inline-flex
              shrink-0
              items-center
              gap-2
              rounded-xl
              bg-[#5624d0]
              px-4
              py-2.5
              text-sm
              font-bold
              text-white
              shadow-md
              shadow-purple-200
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:bg-[#401b9b]
              hover:shadow-lg
            "
          >
            View course

            <ArrowRight
              className="
                h-4
                w-4
                transition-transform
                duration-200
                group-hover:translate-x-0.5
              "
            />
          </Link>
        </div>
      </div>
    </article>
  );
}