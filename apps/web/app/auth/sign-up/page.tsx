"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { signUpSchema } from "@/lib/validations/auth";

type Role = "student" | "instructor";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [role, setRole] = useState<Role>("student");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    /*
     * ---------------------------------------------
     * Zod validation
     * ---------------------------------------------
     */

    const validation = signUpSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
      role,
    });

    if (!validation.success) {
      setError(
        validation.error.issues[0]?.message ??
          "Please check your information.",
      );
      return;
    }

    /*
     * Use validated/normalized values.
     */

    const {
      fullName: validatedFullName,
      email: validatedEmail,
      password: validatedPassword,
      role: validatedRole,
    } = validation.data;

    setLoading(true);

    /*
     * ---------------------------------------------
     * Supabase signup
     * ---------------------------------------------
     */

    const { data, error: signUpError } =
      await supabase.auth.signUp({
        email: validatedEmail,
        password: validatedPassword,

        options: {
          data: {
            full_name: validatedFullName,
            role: validatedRole,
          },

          emailRedirectTo:
            `${window.location.origin}/auth/callback`,
        },
      });

    setLoading(false);

    /*
     * ---------------------------------------------
     * Supabase error
     * ---------------------------------------------
     */

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    /*
     * ---------------------------------------------
     * Immediate session
     * ---------------------------------------------
     */

    if (data.session) {
      router.replace(
        validatedRole === "instructor"
          ? "/instructor"
          : "/dashboard",
      );

      router.refresh();

      return;
    }

    /*
     * ---------------------------------------------
     * Email confirmation required
     * ---------------------------------------------
     */

    setMessage(
      "Account created. Please check your email to confirm your account.",
    );
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-12">
      <div className="w-full rounded-2xl border bg-white p-8 shadow-sm">

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Choose how you want to use the platform.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Role */}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Account type
            </label>

            <div className="grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() => setRole("student")}
                className={`rounded-xl border p-4 text-left transition ${
                  role === "student"
                    ? "border-black bg-gray-50 ring-2 ring-black"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <div className="text-lg font-semibold">
                  Student
                </div>

                <div className="mt-1 text-sm text-gray-600">
                  Learn courses
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("instructor")}
                className={`rounded-xl border p-4 text-left transition ${
                  role === "instructor"
                    ? "border-black bg-gray-50 ring-2 ring-black"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <div className="text-lg font-semibold">
                  Instructor
                </div>

                <div className="mt-1 text-sm text-gray-600">
                  Create courses
                </div>
              </button>

            </div>
          </div>

          {/* Full name */}

          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block text-sm font-medium"
            >
              Full name
            </label>

            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              placeholder="Your full name"
              className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
            />
          </div>

          {/* Email */}

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
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
              className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
            />
          </div>

          {/* Password */}

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
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
              placeholder="••••••••"
              className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
            />
          </div>

          {/* Confirm password */}

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium"
            >
              Confirm password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="••••••••"
              className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-black"
            />
          </div>

          {/* Error */}

          {error && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* Success */}

          {message && (
            <div
              role="status"
              className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
            >
              {message}
            </div>
          )}

          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Creating account..."
              : "Create account"}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-black underline"
          >
            Log in
          </Link>
        </p>

      </div>
    </main>
  );
}