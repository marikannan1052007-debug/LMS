import { createClient } from "@/lib/supabase/server";

export async function getPublishedCourses() {
  const supabase = await createClient();

  const { data, error } = await supabase
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
    .eq("published", true)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}