"use client";

import {
  ChevronDown,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string | null;
  email: string | null;
  role: "student" | "instructor";
};

export default function ProfileMenu() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("full_name, email, role")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile({
          full_name: data.full_name,
          email: data.email ?? user.email ?? null,
          role: data.role,
        });
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.replace("/");
    router.refresh();
  }

  if (loading || !profile) {
    return (
      <div
        className="
          h-10 w-10
          animate-pulse
          rounded-full
          bg-gray-200
        "
      />
    );
  }

  const displayName =
    profile.full_name?.trim() || "User";

  // Only the first letter of the user's name
  const initial =
    displayName.charAt(0).toUpperCase() || "U";

  const roleLabel =
    profile.role === "instructor"
      ? "Instructor"
      : "Student";

  return (
    <div
      ref={menuRef}
      className="relative"
    >
      {/* Profile Button */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open profile menu"
        className="
          flex items-center gap-2
          rounded-full
          border border-gray-200
          bg-white
          p-1.5
          transition-all
          duration-200
          hover:border-gray-300
          hover:shadow-md
        "
      >
        {/* First Letter Avatar */}
        <div
          className="
            flex h-9 w-9
            items-center justify-center
            rounded-full
            bg-[#5624d0]
            text-sm
            font-bold
            text-white
            transition-transform
            duration-200
          "
        >
          {initial}
        </div>

        <ChevronDown
          className={`
            mr-1
            h-4 w-4
            text-gray-500
            transition-transform
            duration-200
            ${open ? "rotate-180" : ""}
          `}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          className="
            absolute
            right-0
            z-50
            mt-3
            w-72
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-xl
          "
        >
          {/* Profile Information */}
          <div className="border-b border-gray-100 p-4">
            <div className="flex items-center gap-3">
              {/* Large First Letter Avatar */}
              <div
                className="
                  flex h-12 w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#5624d0]
                  text-base
                  font-bold
                  text-white
                "
              >
                {initial}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {displayName}
                </p>

                <p className="truncate text-xs text-gray-500">
                  {profile.email}
                </p>

                <span
                  className="
                    mt-1
                    inline-flex
                    rounded-full
                    bg-gray-100
                    px-2
                    py-0.5
                    text-[10px]
                    font-medium
                    text-gray-600
                  "
                >
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

        

          {/* Logout */}
          <div className="border-t border-gray-100 p-2">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="
                flex w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-2.5
                text-sm
                font-medium
                text-red-600
                transition
                hover:bg-red-50
              "
            >
              <LogOut className="h-4 w-4" />

              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}