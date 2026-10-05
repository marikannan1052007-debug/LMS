"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { MobileNav } from "./MobileNav";
import ProfileMenu from "./ProfileMenu";

type Role = "student" | "instructor" | null;

type Profile = {
  full_name: string | null;
  email: string | null;
};

type HeaderProps = {
  contextTitle?: string;
};

export function Header({ contextTitle }: HeaderProps) {
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

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

      if (!mounted) {
        return;
      }

      setRole(
        profileData?.role === "instructor"
          ? "instructor"
          : "student",
      );

      setProfile({
        full_name:
          profileData?.full_name ??
          user.user_metadata?.full_name ??
          null,

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
        if (!mounted) {
          return;
        }

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

        if (!mounted) {
          return;
        }

        setRole(
          profileData?.role === "instructor"
            ? "instructor"
            : "student",
        );

        setProfile({
          full_name:
            profileData?.full_name ??
            session.user.user_metadata?.full_name ??
            null,

          email:
            profileData?.email ??
            session.user.email ??
            null,
        });

        setLoading(false);
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  /*
   * Active desktop navigation item
   */
  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  function navClass(href: string) {
    return `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
      isActive(href)
        ? "bg-purple-50 text-[#5624d0]"
        : "text-[#1c1d1f] hover:bg-gray-50 hover:text-[#5624d0]"
    }`;
  }

  /*
   * Learning player:
   *
   * Keep the header minimal because the learning
   * page already has its own course/lesson navigation.
   */
  const isLearningPage =
    pathname.includes("/learn");
  const learningCourseSlug = isLearningPage
    ? pathname.split("/")[2]
    : undefined;

  return (
    <header className="sticky top-0 z-50 border-b border-[#d1d7dc] bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}

        <Link
          href="/"
          className="min-w-0 truncate text-xl font-black tracking-tight text-[#1c1d1f]"
        >
          {contextTitle || "Learning Platform"}
        </Link>

        {/* Navigation adapts to the signed-in role and current section. */}

        <nav aria-label="Main navigation" className="hidden items-center gap-2 lg:flex">
          {!loading && !isLoggedIn && (
            <>
              <Link
                href="/courses-marketplace"
                className={navClass("/courses-marketplace")}
                aria-current={isActive("/courses-marketplace") ? "page" : undefined}
              >
                Browse Courses
              </Link>

              <Link
                href="/auth/login"
                className={navClass("/auth/login")}
                aria-current={isActive("/auth/login") ? "page" : undefined}
              >
                Log in
              </Link>

              <Link
                href="/auth/sign-up"
                className="
                  bg-[#5624d0]
                  px-4
                  py-2
                  text-sm
                  font-bold
                  text-white
                  transition-colors
                  hover:bg-[#401b9b]
                "
              >
                Sign up
              </Link>
            </>
          )}

          {!loading &&
            isLoggedIn &&
            role === "student" &&
            !isLearningPage && (
              <>
                <Link
                  href="/dashboard"
                  className={navClass("/dashboard")}
                  aria-current={isActive("/dashboard") ? "page" : undefined}
                >
                  Dashboard
                </Link>

                <Link
                  href="/courses-marketplace"
                  className={navClass("/courses-marketplace")}
                  aria-current={isActive("/courses-marketplace") ? "page" : undefined}
                >
                  Browse Courses
                </Link>

                <ProfileMenu />
              </>
            )}

          {!loading &&
            isLoggedIn &&
            role === "student" &&
            isLearningPage && (
              <>
                <Link
                  href="/dashboard"
                  className={navClass("/dashboard")}
                  aria-current={isActive("/dashboard") ? "page" : undefined}
                >
                  My Learning
                </Link>

                {learningCourseSlug && (
                  <Link
                    href={`/courses/${learningCourseSlug}`}
                    className={navClass(`/courses/${learningCourseSlug}`)}
                  >
                    Course overview
                  </Link>
                )}

                <ProfileMenu />
              </>
            )}

          {!loading &&
            isLoggedIn &&
            role === "instructor" && (
              <>
                

                <Link
                  href="/instructor/courses"
                  className={navClass("/instructor/courses")}
                  aria-current={isActive("/instructor/courses") ? "page" : undefined}
                >
                  My Courses
                </Link>

                {pathname !== "/instructor/courses/new" && (
                  <Link
                    href="/instructor/courses/new"
                    className="
                      rounded-lg
                      bg-[#5624d0]
                      px-4
                      py-2
                      text-sm
                      font-bold
                      text-white
                      transition-colors
                      hover:bg-[#401b9b]
                    "
                  >
                    Create Course
                  </Link>
                )}

                <ProfileMenu />
              </>
            )}

          {loading && (
            <div className="h-9 w-24 animate-pulse bg-gray-100" />
          )}
        </nav>

        <div className="lg:hidden">
          <MobileNav />
        </div>
      </div>

    </header>
  );
}