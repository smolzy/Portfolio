import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";
import cloudinary, { FOLDER } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

const DATA_FILE = path.join(process.cwd(), "src", "data", "about.json");
const CLOUDINARY_RAW_ID = `${FOLDER}/about.json`;

async function getAboutData() {
  // 1. Try fetching from Cloudinary Raw storage
  try {
    const resource = await cloudinary.api.resource(CLOUDINARY_RAW_ID, {
      resource_type: "raw",
    });
    if (resource && resource.secure_url) {
      const res = await fetch(resource.secure_url, { cache: "no-store" });
      if (res.ok) {
        return await res.json();
      }
    }
  } catch {
    // Raw file does not exist on Cloudinary yet
  }

  // 2. Fallback to local about.json file
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { bio: "", socials: [], bgm: { enabled: false, title: "", url: "" } };
  }
}

export async function GET() {
  try {
    const data = await getAboutData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("About GET error:", error);
    return NextResponse.json({ bio: "", socials: [] });
  }
}

export async function POST(request: NextRequest) {
  // Auth check
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const jsonString = JSON.stringify(body, null, 2);

    // 1. Try local write (works in local dev)
    try {
      await fs.writeFile(DATA_FILE, jsonString, "utf-8");
    } catch {
      // Ignore on read-only/ephemeral serverless environment
    }

    // 2. Persist to Cloudinary Raw storage (works in production on Vercel)
    const base64Data = `data:application/json;base64,${Buffer.from(jsonString).toString("base64")}`;
    await cloudinary.uploader.upload(base64Data, {
      public_id: CLOUDINARY_RAW_ID,
      resource_type: "raw",
      overwrite: true,
      invalidate: true,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("About save error:", error);
    return NextResponse.json({ error: error?.message || "Save failed" }, { status: 500 });
  }
}
