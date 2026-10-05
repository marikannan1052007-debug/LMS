"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

type LoadingScreenProps = {
  message?: string;
};

const PAGE_NAMES: Record<string, string> = {
  dashboard: "your dashboard",
  courses: "your courses",
  "courses-marketplace": "the course marketplace",
  marketplace: "the marketplace",
  profile: "your profile",
  settings: "your settings",
  learn: "your learning experience",
  lessons: "your lessons",
  lesson: "your lesson",
  students: "your students",
  instructor: "your instructor dashboard",
  create: "the course creator",
  edit: "the editor",
  progress: "your progress",
  enrollments: "your enrollments",
  certificates: "your certificates",
  login: "the login page",
  signup: "the signup page",
  "forgot-password": "password recovery",
  "reset-password": "password recovery",
};

function isUUID(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(
    value,
  );
}

function isNumericId(value: string) {
  return /^\d+$/.test(value);
}

function formatPageName(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[-_]/g, " ");

  if (PAGE_NAMES[value]) {
    return PAGE_NAMES[value];
  }

  if (PAGE_NAMES[normalized]) {
    return PAGE_NAMES[normalized];
  }

  return normalized.replace(
    /\b\w/g,
    (char) => char.toUpperCase(),
  );
}

function getPageName(pathname?: string) {
  if (!pathname || pathname === "/") {
    return "your experience";
  }

  const segments = pathname
    .split("/")
    .filter(Boolean);

  if (segments.length === 0) {
    return "your experience";
  }

  let lastUsefulSegment =
    segments[segments.length - 1];

  if (
    isUUID(lastUsefulSegment) ||
    isNumericId(lastUsefulSegment)
  ) {
    if (segments.length > 1) {
      lastUsefulSegment =
        segments[segments.length - 2];
    }
  }

  return formatPageName(
    lastUsefulSegment,
  );
}

function isCustomMessage(value?: string) {
  if (!value) {
    return false;
  }

  return (
    value.includes(" ") &&
    !value.startsWith("/")
  );
}

export default function LoadingScreen({
  message,
}: LoadingScreenProps) {
  const pathname = usePathname();

  const customMessage =
    isCustomMessage(message);

  const pageLabel = getPageName(
    message && !customMessage
      ? message
      : pathname,
  );

  const heading = customMessage
    ? message
    : `Loading ${pageLabel}...`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.02,
      }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      className="
        fixed
        inset-0
        z-[9999]
        flex
        min-h-screen
        items-center
        justify-center
        overflow-hidden
        bg-[#f7f9fa]
        text-gray-900
      "
    >
      {/* ================================================= */}
      {/* BACKGROUND GLOW */}
      {/* ================================================= */}

      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.12, 0.22, 0.12],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          pointer-events-none
          absolute
          -left-32
          -top-32
          h-96
          w-96
          rounded-full
          bg-purple-300/40
          blur-3xl
        "
      />

      <motion.div
        animate={{
          scale: [1.15, 1, 1.15],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          pointer-events-none
          absolute
          -bottom-32
          -right-32
          h-96
          w-96
          rounded-full
          bg-indigo-300/40
          blur-3xl
        "
      />

      {/* ================================================= */}
      {/* MAIN CONTENT */}
      {/* ================================================= */}

      <div
        className="
          relative
          z-10
          flex
          flex-col
          items-center
          px-6
          text-center
        "
      >
        {/* ================================================= */}
        {/* ANIMATED LOADING ORB */}
        {/* ================================================= */}

        <div
          className="
            relative
            flex
            h-20
            w-20
            items-center
            justify-center
          "
        >
          {/* Outer rotating ring */}

          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="
              absolute
              inset-0
              rounded-full
              border-2
              border-purple-100
              border-t-[#5624d0]
              border-r-purple-400
            "
          />

          {/* Second rotating ring */}

          <motion.div
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="
              absolute
              inset-2
              rounded-full
              border
              border-indigo-100
              border-b-[#7c3aed]
            "
          />

          {/* Main orb */}

          <motion.div
            animate={{
              scale: [
                1,
                1.08,
                1,
              ],
              opacity: [
                0.85,
                1,
                0.85,
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              relative
              h-10
              w-10
              rounded-full
              bg-gradient-to-br
              from-[#5624d0]
              via-[#6d35e5]
              to-[#9b6cff]
              shadow-lg
              shadow-purple-300/50
            "
          >
            {/* Inner glow */}

            <motion.div
              animate={{
                scale: [
                  0.7,
                  1,
                  0.7,
                ],
                opacity: [
                  0.4,
                  0.9,
                  0.4,
                ],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                absolute
                inset-2
                rounded-full
                bg-white/80
                blur-[2px]
              "
            />
          </motion.div>

          {/* Outer pulse */}

          <motion.div
            animate={{
              scale: [
                1,
                1.35,
                1,
              ],
              opacity: [
                0.25,
                0,
                0.25,
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
            className="
              absolute
              inset-0
              rounded-full
              border
              border-purple-400
            "
          />
        </div>

        {/* ================================================= */}
        {/* TEXT */}
        {/* ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
          }}
          className="mt-7"
        >
          <h2
            className="
              text-xl
              font-black
              tracking-tight
              text-gray-900
            "
          >
            {heading}
          </h2>

          <p
            className="
              mt-2
              text-sm
              font-medium
              text-gray-500
            "
          >
            Preparing your learning
            experience...
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}