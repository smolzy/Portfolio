import { NextResponse } from "next/server";
import cloudinary, { FOLDER } from "@/lib/cloudinary";
import { CloudinaryResource, GposeImage } from "@/types";

export async function GET() {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: FOLDER,
      max_results: 100,
      context: true,
      tags: true,
    });

    const images: GposeImage[] = result.resources.map(
      (resource: CloudinaryResource) => ({
        public_id: resource.public_id,
        secure_url: resource.secure_url,
        width: resource.width,
        height: resource.height,
        title: resource.context?.custom?.title || "Untitled",
        zone: resource.context?.custom?.zone || "",
        job: resource.context?.custom?.job || "",
        preset: resource.context?.custom?.preset || "",
        tags: resource.tags || [],
        created_at: resource.created_at,
      })
    );

    // Sort by most recent first
    images.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Gallery fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 }
    );
  }
}
