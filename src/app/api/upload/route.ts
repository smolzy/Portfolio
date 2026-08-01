import { NextRequest, NextResponse } from "next/server";
import cloudinary, { FOLDER } from "@/lib/cloudinary";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  // Auth check
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Environment check
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return NextResponse.json(
      { error: "Cloudinary keys missing in .env.local or Vercel environment variables." },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = (formData.get("title") as string) || "Untitled";
    const zone = (formData.get("zone") as string) || "";
    const job = (formData.get("job") as string) || "";
    const preset = (formData.get("preset") as string) || "";
    const tagsRaw = (formData.get("tags") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const result = await new Promise<{
      public_id: string;
      secure_url: string;
      width: number;
      height: number;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: FOLDER,
            context: { title, zone, job, preset },
            tags,
          },
          (error, result) => {
            if (error || !result) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return NextResponse.json({ success: true, image: result });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
