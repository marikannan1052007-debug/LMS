"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  LogIn,
  LogOut,
  Menu,
  Plus,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Role = "student" | "instructor" | null;

type Profile = {
  full_name: string | null;
  email: string | null;
};

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoggedIn(false);
        setRole(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("role, full_name, email")
        .eq("id", user.id)
        .single();

      setRole(
        profileData?.role === "instructor"
          ? "instructor"
          : "student",
      );

      setProfile({
        full_name: profileData?.full_name ?? null,
        email:
          profileData?.email ??
          user.email ??
          null,
      });

      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session?.user) {
          setIsLoggedIn(false);
          setRole(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setIsLoggedIn(true);

        const { data: profileData } =
          await supabase
            .from("profiles")
            .select("role, full_name, email")
            .eq("id", session.user.id)
            .single();

        setRole(
          profileData?.role === "instructor"
            ? "instructor"
            : "student",
        );

        setProfile({
          full_name:
            profileData?.full_name ?? null,
          email:
            profileData?.email ??
            session.user.email ??
            null,
        });

        setLoading(false);
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  function closeMenu() {
    setOpen(false);
  }

  async function handleLogout() {
    setLoggingOut(true);

    await supabase.auth.signOut();

    setRole(null);
    setProfile(null);
    setIsLoggedIn(false);
    setOpen(false);

    window.location.href = "/";
  }

  const displayName =
    profile?.full_name?.trim() || "User";

  const initial =
    displayName.charAt(0).toUpperCase() || "U";

  const roleLabel =
    role === "instructor"
      ? "Instructor"
      : "Student";
  const learningCourseSlug = pathname.startsWith("/courses/") &&
    pathname.includes("/learn")
      ? pathname.split("/")[2]
      : undefined;

  return (
    <>
      {/* MOBILE MENU BUTTON */}

      <div className="flex items-center lg:hidden">
        <motion.button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="
            flex h-10 w-10
            items-center justify-center
            rounded-full
            border border-[#d1d7dc]
            bg-white
            transition
            hover:bg-[#f7f9fa]
          "
        >
          <Menu className="h-5 w-5" />
        </motion.button>
      </div>

      {/* MOBILE DRAWER */}

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] lg:hidden">

            {/* BACKDROP */}

            <motion.button
              type="button"
              aria-label="Close menu"
              onClick={closeMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="
                absolute inset-0
                bg-black/50
                backdrop-blur-[2px]
              "
            />

            {/* DRAWER */}

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                absolute right-0 top-0
                h-full
                w-[88%]
                max-w-sm
                overflow-y-auto
                bg-white
                shadow-2xl
              "
            >

              {/* PROFILE HEADER */}

              <div
                className="
                  border-b
                  border-[#d1d7dc]
                  bg-gradient-to-br
                  from-white
                  via-white
                  to-purple-50/70
                  px-5
                  py-5
                "
              >
                <div className="flex items-center justify-between">

                  {/* PROFILE */}

                  <motion.div
                    initial={{
                      opacity: 0,
                      x: 15,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: 0.15,
                    }}
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-3
                    "
                  >
                    {isLoggedIn ? (
                      <>
                        {/* AVATAR */}

                        <div
                          className="
                            flex
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-[#5624d0]
                            text-lg
                            font-black
                            text-white
                            shadow-lg
                            shadow-purple-200
                          "
                        >
                          {initial}
                        </div>

                        {/* USER DETAILS */}

                        <div className="min-w-0">
                          <p
                            className="
                              truncate
                              text-sm
                              font-black
                              text-gray-950
                            "
                          >
                            {displayName}
                          </p>

                          <p
                            className="
                              mt-0.5
                              max-w-[190px]
                              truncate
                              text-xs
                              text-[#6a6f73]
                            "
                          >
                            {profile?.email}
                          </p>

                          <span
                            className="
                              mt-1.5
                              inline-flex
                              rounded-full
                              bg-purple-100
                              px-2
                              py-0.5
                              text-[10px]
                              font-bold
                              text-[#5624d0]
                            "
                          >
                            {roleLabel}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div>
                        <p
                          className="
                            text-lg
                            font-black
                            tracking-tight
                            text-gray-950
                          "
                        >
                          Learning Platform
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-xs
                            text-[#6a6f73]
                          "
                        >
                          Learn. Build. Grow.
                        </p>
                      </div>
                    )}
                  </motion.div>

                  {/* CLOSE */}

                  <motion.button
                    type="button"
                    onClick={closeMenu}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="
                      ml-3
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      text-[#6a6f73]
                      transition
                      hover:bg-gray-100
                      hover:text-gray-900
                    "
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>

              {/* NAVIGATION */}

              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      delayChildren: 0.15,
                      staggerChildren: 0.07,
                    },
                  },
                }}
                className="p-5"
              >

                {/* LOADING */}

                {loading && (
                  <div className="space-y-3">
                    <div className="h-12 animate-pulse rounded-xl bg-[#f7f9fa]" />
                    <div className="h-12 animate-pulse rounded-xl bg-[#f7f9fa]" />
                    <div className="h-12 animate-pulse rounded-xl bg-[#f7f9fa]" />
                  </div>
                )}

                {/* LOGGED OUT */}

                {!loading && !isLoggedIn && (
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
                      duration: 0.35,
                    }}
                  >
                    <h2
                      className="
                        mb-3
                        text-xs
                        font-bold
                        uppercase
                        tracking-[0.14em]
                        text-[#6a6f73]
                      "
                    >
                      Welcome
                    </h2>

                    <div className="space-y-2">

                      <Link
                        href="/auth/login"
                        onClick={closeMenu}
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          border
                          border-[#d1d7dc]
                          px-4
                          py-4
                          text-sm
                          font-bold
                          transition
                          hover:border-[#5624d0]
                          hover:bg-[#f7f9fa]
                        "
                      >
                        <LogIn className="h-5 w-5 text-[#5624d0]" />
                        Log in
                      </Link>

                      <Link
                        href="/auth/sign-up"
                        onClick={closeMenu}
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          bg-[#5624d0]
                          px-4
                          py-4
                          text-sm
                          font-bold
                          text-white
                          transition
                          hover:bg-[#401b9b]
                        "
                      >
                        <UserPlus className="h-5 w-5" />
                        Sign up
                      </Link>

                    </div>
                  </motion.div>
                )}

                {/* STUDENT */}

                {!loading &&
                  isLoggedIn &&
                  role === "student" && (
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
                        duration: 0.35,
                      }}
                    >
                      <h2
                        className="
                          mb-3
                          text-xs
                          font-bold
                          uppercase
                          tracking-[0.14em]
                          text-[#6a6f73]
                        "
                      >
                        Learning
                      </h2>

                      <div className="space-y-2">

                        {learningCourseSlug && (
                          <Link
                            href={`/courses/${learningCourseSlug}`}
                            onClick={closeMenu}
                            className="
                              group
                              flex
                              items-center
                              justify-between
                              rounded-xl
                              border
                              border-transparent
                              px-4
                              py-4
                              text-sm
                              font-bold
                              transition
                              hover:border-[#d1d7dc]
                              hover:bg-[#f7f9fa]
                            "
                          >
                            <span className="flex items-center gap-3">
                              <BookOpen className="h-5 w-5 text-[#5624d0]" />
                              Course overview
                            </span>
                            <span className="text-lg text-[#6a6f73]">→</span>
                          </Link>
                        )}

                        <Link
                          href="/courses-marketplace"
                          onClick={closeMenu}
                          className="
                            group
                            flex
                            items-center
                            justify-between
                            rounded-xl
                            border
                            border-transparent
                            px-4
                            py-4
                            text-sm
                            font-bold
                            transition
                            hover:border-[#d1d7dc]
                            hover:bg-[#f7f9fa]
                          "
                        >
                          <span className="flex items-center gap-3">
                            <BookOpen className="h-5 w-5 text-[#5624d0]" />
                            Explore Courses
                          </span>

                          <span
                            className="
                              text-lg
                              text-[#6a6f73]
                              transition-transform
                              duration-300
                              group-hover:translate-x-1
                              group-hover:text-[#5624d0]
                            "
                          >
                            →
                          </span>
                        </Link>

                        <Link
                          href="/dashboard"
                          onClick={closeMenu}
                          className="
                            group
                            flex
                            items-center
                            justify-between
                            rounded-xl
                            border
                            border-transparent
                            px-4
                            py-4
                            text-sm
                            font-bold
                            transition
                            hover:border-[#d1d7dc]
                            hover:bg-[#f7f9fa]
                          "
                        >
                          <span className="flex items-center gap-3">
                            <GraduationCap className="h-5 w-5 text-[#5624d0]" />
                            My Learning
                          </span>

                          <span
                            className="
                              text-lg
                              text-[#6a6f73]
                              transition-transform
                              duration-300
                              group-hover:translate-x-1
                              group-hover:text-[#5624d0]
                            "
                          >
                            →
                          </span>
                        </Link>

                      </div>
                    </motion.div>
                  )}

                {/* INSTRUCTOR */}

                {!loading &&
                  isLoggedIn &&
                  role === "instructor" && (
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
                        duration: 0.35,
                      }}
                    >
                      <h2
                        className="
                          mb-3
                          text-xs
                          font-bold
                          uppercase
                          tracking-[0.14em]
                          text-[#6a6f73]
                        "
                      >
                        Teaching
                      </h2>

                      <div className="space-y-2">

                        <Link
                          href="/instructor/courses"
                          onClick={closeMenu}
                          className="
                            group
                            flex
                            items-center
                            justify-between
                            rounded-xl
                            border
                            border-transparent
                            px-4
                            py-4
                            text-sm
                            font-bold
                            transition
                            hover:border-[#d1d7dc]
                            hover:bg-[#f7f9fa]
                          "
                        >
                          <span className="flex items-center gap-3">
                            <GraduationCap className="h-5 w-5 text-[#5624d0]" />
                            Instructor Dashboard
                          </span>

                          <span
                            className="
                              text-lg
                              text-[#6a6f73]
                              transition-transform
                              duration-300
                              group-hover:translate-x-1
                              group-hover:text-[#5624d0]
                            "
                          >
                            →
                          </span>
                        </Link>

                        <Link
                          href="/instructor/courses"
                          onClick={closeMenu}
                          className="
                            group
                            flex
                            items-center
                            justify-between
                            rounded-xl
                            border
                            border-transparent
                            px-4
                            py-4
                            text-sm
                            font-bold
                            transition
                            hover:border-[#d1d7dc]
                            hover:bg-[#f7f9fa]
                          "
                        >
                          <span className="flex items-center gap-3">
                            <BookOpen className="h-5 w-5 text-[#5624d0]" />
                            Manage Courses
                          </span>

                          <span
                            className="
                              text-lg
                              text-[#6a6f73]
                              transition-transform
                              duration-300
                              group-hover:translate-x-1
                              group-hover:text-[#5624d0]
                            "
                          >
                            →
                          </span>
                        </Link>

                        <Link
                          href="/instructor/courses/new"
                          onClick={closeMenu}
                          className="
                            group
                            flex
                            items-center
                            justify-between
                            rounded-xl
                            bg-[#5624d0]
                            px-4
                            py-4
                            text-sm
                            font-bold
                            text-white
                            transition
                            hover:bg-[#401b9b]
                          "
                        >
                          <span className="flex items-center gap-3">
                            <Plus className="h-5 w-5" />
                            Create Course
                          </span>

                          <span
                            className="
                              text-lg
                              transition-transform
                              duration-300
                              group-hover:translate-x-1
                            "
                          >
                            →
                          </span>
                        </Link>

                      </div>
                    </motion.div>
                  )}

                {/* LOGOUT */}

                {!loading && isLoggedIn && (
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
                      duration: 0.35,
                    }}
                    className="mt-8"
                  >
                    <motion.button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      whileHover={{
                        scale: 1.01,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      className="
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-3
                        rounded-xl
                        border
                        border-red-200
                        bg-red-50
                        px-4
                        py-4
                        text-sm
                        font-bold
                        text-red-600
                        transition
                        hover:bg-red-100
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      <LogOut className="h-4 w-4" />

                      {loggingOut
                        ? "Logging out..."
                        : "Log out"}
                    </motion.button>
                  </motion.div>
                )}

              </motion.div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}