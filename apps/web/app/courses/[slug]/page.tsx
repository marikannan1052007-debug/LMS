import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { EnrollButton } from "@/components/EnrollButton";
import { createClient } from "@/lib/supabase/server";
import { 
 
  Clock, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2 
} from "lucide-react";

type CoursePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select(`
      id,
      title,
      slug,
      description,
      thumbnail_url,
      category,
      level,
      price,
      published,
      instructor_id
    `)
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !course) {
    notFound();
  }

  const isFree = Number(course.price) === 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          
          {/* MAIN CONTENT AREA */}
          <section className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Category & Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-[#5624d0]">
               
                {course.category ?? "Course"}
              </span>

              {course.level && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/70 px-3 py-1 text-xs font-medium text-slate-700">
                 
                  {course.level}
                </span>
              )}
            </div>

            {/* Course Title */}
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl lg:leading-tight">
              {course.title}
            </h1>

            {/* Course Description */}
            {course.description && (
              <p className="text-base text-slate-600 sm:text-lg sm:leading-relaxed">
                {course.description}
              </p>
            )}

            {/* Core Value Highlights */}
            <div className="pt-4 border-t border-slate-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                What you get
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2 text-sm text-slate-700">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Full lifetime access</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Learn at your own pace</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Access on mobile and desktop</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Self-assessment progress tracking</span>
                </li>
              </ul>
            </div>
          </section>

          {/* STICKY ENROLLMENT CARD */}
          <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-8">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
              
              {/* Thumbnail Image */}
              <div className="relative aspect-video w-full bg-slate-100">
                {course.thumbnail_url ? (
                  <Image
                    src={course.thumbnail_url}
                    alt={course.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 400px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
                    <BookOpen className="h-8 w-8" />
                    <span className="text-xs font-medium">No Image Available</span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Pricing */}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">
                    {isFree ? "Free" : `₹${Number(course.price).toLocaleString("en-IN")}`}
                  </span>
                </div>

                {/* Enrollment Button */}
                <div className="mt-2">
                  <EnrollButton courseId={course.id} courseSlug={course.slug} />
                </div>

                {/* Guarantee / Info text */}
                <div className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <div className="flex items-center justify-center gap-1.5 text-center font-medium">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Instant, unlimited access after enrollment</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-center font-medium">
                    <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                    <span>Secure enrollment process</span>
                  </div>
                </div>

              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}