"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import LoadingScreen from "@/components/loading/LoadingScreen";
import { createClient } from "@/lib/supabase/client";
import { signInSchema } from "@/lib/validations/auth";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    /*
     * ---------------------------------------------
     * Zod validation
     * ---------------------------------------------
     */

    const validation = signInSchema.safeParse({
      email,
      password,
    });

    if (!validation.success) {
      setError(
        validation.error.issues[0]?.message ??
          "Please check your login details.",
      );
      return;
    }

    /*
     * Use validated/normalized data.
     */

    const { email: validatedEmail, password: validatedPassword } =
      validation.data;

    setLoading(true);

    /*
     * ---------------------------------------------
     * Supabase authentication
     * ---------------------------------------------
     */

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: validatedEmail,
        password: validatedPassword,
      });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    /*
     * ---------------------------------------------
     * Get authenticated user
     * ---------------------------------------------
     */

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Unable to load your account.");
      setLoading(false);
      return;
    }

    /*
     * ---------------------------------------------
     * Load application role
     * ---------------------------------------------
     */

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) {
      console.error(
        "Profile loading error:",
        profileError,
      );

      setError(
        "Your account profile could not be found. Please contact support.",
      );

      setLoading(false);
      return;
    }

    /*
     * ---------------------------------------------
     * Role-based navigation
     * ---------------------------------------------
     */

    if (profile.role === "instructor") {
      router.replace("/instructor");
    } else {
      router.replace("/dashboard");
    }

    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f9fa] px-6">
      <div className="w-full max-w-md border border-[#d1d7dc] bg-white p-8 shadow-sm">

        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight">
            Log in
          </h1>

          <p className="mt-2 text-sm text-[#6a6f73]">
            Welcome back. Continue learning where you left off.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-bold"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              className="h-12 w-full border border-[#1c1d1f] px-4 outline-none focus:ring-2 focus:ring-[#5624d0]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-bold"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              className="h-12 w-full border border-[#1c1d1f] px-4 outline-none focus:ring-2 focus:ring-[#5624d0]"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="border border-red-300 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full bg-[#5624d0] font-bold text-white transition hover:bg-[#401b9b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Logging in..."
              : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6a6f73]">
          Don&apos;t have an account?{" "}
          <a
            href="/auth/sign-up"
            className="font-bold text-[#5624d0] hover:underline"
          >
            Sign up
          </a>
        </p>

      </div>
    </main>
  );
}