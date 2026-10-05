"use client";

import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();

    window.location.href = "/";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex h-12 items-center justify-center border border-[#1c1d1f] px-6 font-bold transition hover:bg-gray-50"
    >
      Log out
    </button>
  );
}