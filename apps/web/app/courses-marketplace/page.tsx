"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRight,} from "lucide-react";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { CourseCard } from "@/components/CourseCard";
import { Header } from "@/components/Header";
import { searchCourses } from "@/lib/course-search";

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

const categories = [
  "All",
  "Development",
  "Business",
  "Finance & Accounting",
  "IT & Software",
  "Office Productivity",
  "Personal Development",
  "Design",
  "Marketing",
  "Health & Fitness",
];

/* =========================================================
   COURSE GRID ANIMATION
========================================================= */

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.98,
  },

  visible: {
    opacity: 1,
    y: 0,
    scale: 1,

    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* =========================================================
   COURSE CARD
========================================================= */

function GlassCourseCard({
  course,
}: {
  course: Course;
}) {
  return (
    <motion.div
      variants={itemVariants}
      layout
      exit={{
        opacity: 0,
        y: 12,
        scale: 0.98,
        transition: { duration: 0.18, ease: "easeIn" },
      }}
      whileHover={{
        y: -4,
        scale: 1.01,

        transition: {
          duration: 0.2,
          ease: "easeOut",
        },
      }}
      transition={{
        layout: {
          type: "spring",
          stiffness: 360,
          damping: 32,
        },
      }}
      className="group relative"
    >
      {/* Ambient glow */}

      <div
        className="
          pointer-events-none
          absolute
          -inset-1
          rounded-2xl
          bg-gradient-to-r
          from-purple-500/20
          via-fuchsia-500/10
          to-indigo-500/20
          opacity-0
          blur-xl
          transition-opacity
          duration-500
          group-hover:opacity-100
        "
      />

      {/* Glass container */}

      <div
        className="
          relative
          overflow-hidden
          rounded-2xl
          border
          border-white/50
          bg-white/70
          shadow-[0_10px_40px_rgba(0,0,0,0.06)]
          backdrop-blur-xl
          transition-all
          duration-500
          group-hover:border-white/80
          group-hover:shadow-[0_20px_60px_rgba(86,36,208,0.14)]
        "
      >
        <CourseCard course={course} />
      </div>
    </motion.div>
  );
}

/* =========================================================
   MARKETPLACE CONTENT
========================================================= */

function CoursesPageContent() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [loadingCourses, setLoadingCourses] =
    useState(true);

  const [error, setError] = useState("");

  const searchParams = useSearchParams();

  const urlSearch =
    searchParams.get("search") ?? "";

  const [search, setSearch] =
    useState(urlSearch);

  const [suggestionsOpen, setSuggestionsOpen] =
    useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] =
    useState(-1);

  const searchContainerRef =
    useRef<HTMLDivElement>(null);

  /*
   * Reference to the course-card section.
   * Used to scroll down smoothly on category click or search submit.
   */
  const coursesSectionRef =
    useRef<HTMLDivElement>(null);

  /* =======================================================
     LOAD COURSES
  ======================================================= */

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoadingCourses(true);
        setError("");

        const response =
          await fetch("/api/courses");

        if (!response.ok) {
          throw new Error(
            "Failed to load courses.",
          );
        }

        const data: Course[] =
          await response.json();

        setCourses(data);
      } catch (error) {
        console.error(
          "Failed to load courses:",
          error,
        );

        setError(
          "Unable to load courses right now.",
        );
      } finally {
        setLoadingCourses(false);
      }
    }

    loadCourses();
  }, []);

  /* =======================================================
     FILTER COURSES (Category + Search scoping)
  ======================================================= */

  const filteredCourses = useMemo(() => {
    let result = courses;

    /*
     * 1. Category filter
     * Step 1 narrows down the pool to only items in the selected category
     */
    if (selectedCategory !== "All") {
      result = result.filter(
        (course) =>
          course.category?.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    /*
     * 2. Search filter
     * Step 2 runs search strictly on the category-filtered subset
     */
    if (search.trim()) {
      result = searchCourses(
        result,
        search,
      );
    }

    return result;
  }, [
    courses,
    selectedCategory,
    search,
  ]);

  const suggestions = useMemo(
    () => filteredCourses.slice(0, 6),
    [filteredCourses],
  );

  useEffect(() => {
    if (!suggestionsOpen) {
      return;
    }

    function handleOutsidePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !searchContainerRef.current?.contains(event.target)
      ) {
        setSuggestionsOpen(false);
        setActiveSuggestionIndex(-1);
      }
    }

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
    };
  }, [suggestionsOpen]);

  /* =======================================================
     SCROLL UTILITY
  ======================================================= */

  function scrollToCourses() {
    requestAnimationFrame(() => {
      coursesSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  /* =======================================================
     HANDLERS
  ======================================================= */

  function handleCategorySelect(category: string) {
    setSelectedCategory(category);
    setSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
    scrollToCourses();
  }

  function handleSearchSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);

    if (!search.trim()) {
      return;
    }

    scrollToCourses();
  }

  function handleSearchKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Escape") {
      setSuggestionsOpen(false);
      setActiveSuggestionIndex(-1);
      return;
    }

    if (!suggestionsOpen || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestionIndex((index) =>
        index >= suggestions.length - 1 ? 0 : index + 1,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestionIndex((index) =>
        index <= 0 ? suggestions.length - 1 : index - 1,
      );
    } else if (
      event.key === "Enter" &&
      activeSuggestionIndex >= 0
    ) {
      event.preventDefault();
      const selectedCourse = suggestions[activeSuggestionIndex];
      if (selectedCourse) {
        setSuggestionsOpen(false);
        router.push(`/courses/${selectedCourse.slug}`);
      }
    }
  }

  function clearFilters() {
    setSearch("");
    setSelectedCategory("All");
    setSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <Header />

      <main
        className="
          relative
          min-h-screen
          overflow-hidden
          bg-[#f7f9fa]
        "
      >
        {/* =================================================
            AMBIENT BACKGROUND
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            overflow-hidden
          "
        >
          {/* Purple glow */}
          <motion.div
            animate={{
              x: [0, 80, -40, 0],
              y: [0, -40, 60, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              absolute
              -left-32
              -top-32
              h-[420px]
              w-[420px]
              rounded-full
              bg-purple-400/15
              blur-3xl
            "
          />

          {/* Indigo glow */}
          <motion.div
            animate={{
              x: [0, -70, 40, 0],
              y: [0, 50, -30, 0],
              scale: [1, 0.9, 1.08, 1],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              absolute
              right-[-150px]
              top-[25%]
              h-[500px]
              w-[500px]
              rounded-full
              bg-indigo-400/10
              blur-3xl
            "
          />

          {/* Bottom glow */}
          <motion.div
            animate={{
              y: [0, -50, 20, 0],
              x: [0, 40, -30, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              absolute
              bottom-[-200px]
              left-[35%]
              h-[450px]
              w-[450px]
              rounded-full
              bg-fuchsia-300/10
              blur-3xl
            "
          />

          {/* Grid texture */}
          <div
            className="
              absolute
              inset-0
              opacity-[0.025]
            "
            style={{
              backgroundImage:
                "linear-gradient(#1c1d1f 1px, transparent 1px), linear-gradient(90deg, #1c1d1f 1px, transparent 1px)",
              backgroundSize:
                "40px 40px",
            }}
          />
        </div>

        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="
            relative
            border-b
            border-white/60
          "
        >
          <div
            className="
              mx-auto
              max-w-7xl
              px-6
              py-16
              lg:px-8
              lg:py-20
            "
          >
            <div className="max-w-4xl">
              {/* Badge */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.5,
                }}
              >
                <span
                  className="
                    inline-flex
                    rounded-full
                    border
                    border-purple-200/60
                    bg-purple-50/70
                    px-4
                    py-2
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.16em]
                    text-[#5624d0]
                    backdrop-blur-md
                  "
                >
                  Learning marketplace
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.7,
                  delay: 0.08,
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                }}
                className="
                  mt-6
                  text-5xl
                  font-black
                  tracking-[-0.04em]
                  text-[#1c1d1f]
                  md:text-6xl
                  lg:text-7xl
                "
              >
                Find something
                <br />
                <span
                  className="
                    bg-gradient-to-r
                    from-[#5624d0]
                    via-purple-500
                    to-indigo-500
                    bg-clip-text
                    text-transparent
                  "
                >
                  worth learning.
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.18,
                }}
                className="
                  mt-6
                  max-w-2xl
                  text-lg
                  leading-8
                  text-[#6a6f73]
                  md:text-xl
                "
              >
                Explore practical courses
                taught by experienced
                instructors and learn at
                your own pace.
              </motion.p>

              {/* =================================================
                  SEARCH
              ================================================= */}

              <div
                ref={searchContainerRef}
                className="relative mt-8 w-full max-w-3xl"
              >
                <motion.form
                  id="course-search-form"
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.6,
                    delay: 0.25,
                  }}
                  onSubmit={handleSearchSubmit}
                  className="
                    group
                    relative
                    flex
                    w-full
                    rounded-2xl
                    border
                    border-white/70
                    bg-white/60
                    p-1.5
                    shadow-[0_20px_60px_rgba(0,0,0,0.08)]
                    backdrop-blur-2xl
                    transition-all
                    duration-300
                    focus-within:border-purple-300
                    focus-within:shadow-[0_20px_70px_rgba(86,36,208,0.15)]
                  "
                >
                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-gradient-to-r
                    from-purple-500/[0.04]
                    via-transparent
                    to-indigo-500/[0.04]
                  "
                />

                <div
                  className="
                    relative
                    flex
                    min-w-0
                    flex-1
                    items-center
                  "
                >
                  <svg
                    className="
                      ml-4
                      h-5
                      w-5
                      shrink-0
                      text-[#6a6f73]
                    "
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="7"
                    />
                    <path d="m20 20-3.5-3.5" />
                  </svg>

                  <input
                    type="search"
                    value={search}
                    onFocus={() => {
                      if (search.trim()) {
                        setSuggestionsOpen(true);
                      }
                    }}
                    onKeyDown={handleSearchKeyDown}
                    onChange={(event) => {
                      setSearch(
                        event.target.value,
                      );
                      setSuggestionsOpen(
                        Boolean(event.target.value.trim()),
                      );
                      setActiveSuggestionIndex(-1);
                    }}
                    placeholder={
                      selectedCategory === "All"
                        ? "What do you want to learn?"
                        : `Search in ${selectedCategory}...`
                    }
                    aria-label="Search courses"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={
                      suggestionsOpen && Boolean(search.trim())
                    }
                    aria-controls={
                      suggestionsOpen && search.trim()
                        ? "course-search-suggestions"
                        : undefined
                    }
                    aria-activedescendant={
                      activeSuggestionIndex >= 0
                        ? `course-suggestion-${activeSuggestionIndex}`
                        : undefined
                    }
                    className="
                      h-14
                      min-w-0
                      flex-1
                      bg-transparent
                      px-4
                      text-sm
                      font-medium
                      outline-none
                      placeholder:text-[#8a8f94]
                    "
                  />
                </div>

                <motion.button
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  type="submit"
                  className="
                    relative
                    rounded-xl
                    bg-[#5624d0]
                    px-7
                    text-sm
                    font-black
                    text-white
                    shadow-lg
                    shadow-purple-500/20
                    transition
                    hover:bg-[#401b9b]
                  "
                >
                  Search
                </motion.button>
                </motion.form>
                <AnimatePresence initial={false}>
                  {suggestionsOpen && search.trim() && (
                    <motion.div
                      id="course-search-suggestions"
                      role="listbox"
                      aria-label="Matching courses"
                      initial={{ opacity: 0, y: -6, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.99 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute left-0 right-0 top-full z-50 mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/15"
                    >
                    {loadingCourses ? (
                    <p className="px-5 py-4 text-sm text-gray-500">
                      Finding courses...
                    </p>
                  ) : suggestions.length > 0 ? (
                    <>
                      <p className="px-5 pb-2 pt-4 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Courses
                      </p>
                      {suggestions.map((course, index) => (
                        <Link
                          id={`course-suggestion-${index}`}
                          key={course.id}
                          href={`/courses/${course.slug}`}
                          role="option"
                          aria-selected={activeSuggestionIndex === index}
                          onMouseEnter={() =>
                            setActiveSuggestionIndex(index)
                          }
                          onClick={() => setSuggestionsOpen(false)}
                          className={`flex items-center gap-3 px-5 py-3 transition-colors ${
                            activeSuggestionIndex === index
                              ? "bg-purple-50"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          {course.thumbnail_url ? (
                            <Image
                              src={course.thumbnail_url}
                              alt=""
                              className="h-11 w-16 shrink-0 rounded-lg object-cover"
                            />
                          ) : null}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-gray-900">
                              {course.title}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-gray-500">
                              {[course.category, course.level]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
                        </Link>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setSuggestionsOpen(false);
                          scrollToCourses();
                        }}
                        className="w-full border-t border-gray-100 px-5 py-3 text-left text-sm font-semibold text-[#5624d0] transition-colors hover:bg-purple-50"
                      >
                        See all results for “{search.trim()}”
                      </button>
                    </>
                  ) : (
                    <p className="px-5 py-4 text-sm text-gray-500">
                      No matching courses found.
                    </p>
                  )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            MARKETPLACE
        ================================================= */}

        <section
          ref={coursesSectionRef}
          className="
            relative
            mx-auto
            w-full
            max-w-7xl
            scroll-mt-8
            px-6
            py-14
            lg:px-8
            lg:py-16
          "
        >
          {/* =================================================
              HEADING
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.5,
            }}
            className="
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div>
              

              <h2
                className="
                  mt-2
                  text-3xl
                  font-black
                  tracking-tight
                  md:text-4xl
                "
              >
                Explore courses
              </h2>

              <p
                className="
                  mt-2
                  text-[#6a6f73]
                "
              >
                Choose a course that
                matches what you want
                to learn.
              </p>
            </div>

            {/* Course count */}
            <div
              className="
                rounded-full
                border
                border-white/70
                bg-white/60
                px-4
                py-2
                text-sm
                text-[#6a6f73]
                shadow-sm
                backdrop-blur-xl
              "
            >
              {loadingCourses ? (
                "Loading..."
              ) : (
                <>
                  <span
                    className="
                      font-black
                      text-[#1c1d1f]
                    "
                  >
                    {filteredCourses.length}
                  </span>{" "}
                  {filteredCourses.length === 1
                    ? "course"
                    : "courses"}{" "}
                  {selectedCategory !== "All" && (
                    <span className="text-xs text-purple-700">
                      in {selectedCategory}
                    </span>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {/* =================================================
              CATEGORIES
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            className="mt-8"
          >
            <div
              className="
                overflow-x-auto
                pb-2
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              <div
                className="
                  inline-flex
                  min-w-max
                  gap-2
                  rounded-2xl
                  border
                  border-gray-200/80
                  bg-white/70
                  p-2
                  shadow-sm
                  backdrop-blur-xl
                "
              >
                {categories.map(
                  (category) => {
                    const active =
                      selectedCategory ===
                      category;

                    return (
                      <motion.button
                        key={category}
                        type="button"
                        onClick={() =>
                          handleCategorySelect(
                            category,
                          )
                        }
                        aria-pressed={active}
                        whileTap={{
                          scale: 0.97,
                        }}
                        className="
                          relative
                          min-h-11
                          whitespace-nowrap
                          rounded-xl
                          px-5
                          py-2.5
                          text-sm
                          font-bold
                          outline-none
                          transition-colors
                          focus-visible:ring-2
                          focus-visible:ring-[#5624d0]
                          focus-visible:ring-offset-2
                        "
                      >
                        {active && (
                          <motion.span
                            layoutId="active-category"
                            className="
                              absolute
                              inset-0
                              rounded-xl
                              bg-[#1c1d1f]
                              shadow-sm
                            "
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}

                        <span
                          className={`
                            relative
                            z-10
                            ${
                              active
                                ? "text-white"
                                : "text-[#6a6f73] hover:text-[#1c1d1f]"
                            }
                          `}
                        >
                          {category}
                        </span>
                      </motion.button>
                    );
                  },
                )}
              </div>
            </div>
          </motion.div>

          {/* =================================================
              ERROR
          ================================================= */}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                className="
                  mt-8
                  rounded-2xl
                  border
                  border-red-200/70
                  bg-red-50/70
                  p-6
                  shadow-sm
                  backdrop-blur-xl
                "
              >
                <h3
                  className="
                    font-bold
                    text-red-800
                  "
                >
                  Something went wrong
                </h3>

                <p
                  className="
                    mt-1
                    text-sm
                    text-red-700
                  "
                >
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    window.location.reload()
                  }
                  className="
                    mt-4
                    rounded-xl
                    bg-red-700
                    px-5
                    py-2.5
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-red-800
                  "
                >
                  Try again
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* =================================================
              LOADING
          ================================================= */}

          {loadingCourses && !error && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              className="
                mt-10
                grid
                gap-6
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
              "
            >
              {Array.from({
                length: 8,
              }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  transition={{
                    delay: index * 0.04,
                  }}
                  className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/70
                    bg-white/60
                    p-1
                    shadow-sm
                    backdrop-blur-xl
                  "
                >
                  <div
                    className="
                      h-44
                      animate-pulse
                      rounded-xl
                      bg-gradient-to-br
                      from-gray-200
                      via-gray-100
                      to-gray-200
                    "
                  />

                  <div className="space-y-3 p-5">
                    <div
                      className="
                        h-3
                        w-24
                        animate-pulse
                        rounded
                        bg-gray-200
                      "
                    />

                    <div
                      className="
                        h-5
                        w-full
                        animate-pulse
                        rounded
                        bg-gray-200
                      "
                    />

                    <div
                      className="
                        h-4
                        w-3/4
                        animate-pulse
                        rounded
                        bg-gray-200
                      "
                    />

                    <div
                      className="
                        h-4
                        w-1/2
                        animate-pulse
                        rounded
                        bg-gray-200
                      "
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* =================================================
              COURSES
          ================================================= */}

          <AnimatePresence initial={false}>
            {!loadingCourses &&
              !error &&
              filteredCourses.length > 0 && (
              <motion.div
                key="course-results"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{
                  opacity: 0,
                  y: 8,
                  transition: { duration: 0.16 },
                }}
                layout
                transition={{
                  layout: {
                    type: "spring",
                    stiffness: 360,
                    damping: 32,
                  },
                }}
                className="
                  mt-10
                  grid
                  scroll-mt-24
                  gap-7
                  sm:grid-cols-2
                  lg:grid-cols-3
                  xl:grid-cols-4
                "
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {filteredCourses.map((course) => (
                    <GlassCourseCard
                      key={course.id}
                      course={course}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* =================================================
              NO RESULTS
          ================================================= */}

          <AnimatePresence initial={false}>
            {!loadingCourses &&
              !error &&
              filteredCourses.length === 0 && (
              <motion.div
                key="no-course-results"
                initial={{
                  opacity: 0,
                  scale: 0.97,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.98,
                  transition: { duration: 0.16 },
                }}
                className="
                  mt-10
                  overflow-hidden
                  rounded-3xl
                  border
                  border-white/70
                  bg-white/60
                  px-6
                  py-20
                  text-center
                  shadow-[0_20px_60px_rgba(0,0,0,0.05)]
                  backdrop-blur-2xl
                "
              >
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="
                    mx-auto
                    flex
                    h-20
                    w-20
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-purple-200/70
                    bg-purple-50/70
                    text-3xl
                    shadow-lg
                    shadow-purple-500/10
                  "
                >
                  📚
                </motion.div>

                <h3
                  className="
                    mt-6
                    text-2xl
                    font-black
                  "
                >
                  No courses found
                </h3>

                <p
                  className="
                    mx-auto
                    mt-2
                    max-w-md
                    text-sm
                    leading-6
                    text-[#6a6f73]
                  "
                >
                  {search
                    ? `No results found for "${search}" ${
                        selectedCategory !== "All"
                          ? `in the ${selectedCategory} category`
                          : ""
                      }.`
                    : `No courses available in ${selectedCategory}.`}
                </p>

                <motion.button
                  whileHover={{
                    scale: 1.03,
                    y: -2,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  type="button"
                  onClick={clearFilters}
                  className="
                    mt-7
                    rounded-xl
                    bg-[#5624d0]
                    px-6
                    py-3
                    text-sm
                    font-black
                    text-white
                    shadow-lg
                    shadow-purple-500/20
                    transition
                    hover:bg-[#401b9b]
                  "
                >
                  Clear filters
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </>
  );
}

/* =========================================================
   EXPORT PAGE WITH SUSPENSE
========================================================= */

export default function CoursesPage() {
  return (
    <Suspense fallback={null}>
      <CoursesPageContent />
    </Suspense>
  );
}