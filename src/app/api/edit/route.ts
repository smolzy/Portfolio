import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { public_id, title, zone, job, preset, tags } = body;

    if (!public_id) {
      return NextResponse.json({ error: "Missing public_id" }, { status: 400 });
    }

    const tagsArray = Array.isArray(tags)
      ? tags
      : (tags || "")
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean);

    // 1. Replace tags on Cloudinary asset
    await cloudinary.uploader.replace_tag(tagsArray, [public_id]);

    // 2. Update custom context metadata (title, zone, job, preset)
    await cloudinary.uploader.add_context(
      `title=${title || ""}|zone=${zone || ""}|job=${job || ""}|preset=${preset || ""}`,
      [public_id]
    );

    return NextResponse.json({ success: true, tags: tagsArray });
  } catch (error: any) {
    console.error("Edit asset error:", error);
    return NextResponse.json({ error: error?.message || "Edit failed" }, { status: 500 });
  }
}
