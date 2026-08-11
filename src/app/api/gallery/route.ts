import { NextResponse } from "next/server";
import cloudinary, { FOLDER } from "@/lib/cloudinary";
import { CloudinaryResource, GposeImage } from "@/types";

// Cache gallery results for 60 seconds to avoid hammering Cloudinary on each visit
export const revalidate = 60;

export async function GET() {

  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: FOLDER,
      max_results: 100,
      context: true,
      tags: true,
    });

    // Helper: inject Cloudinary transformation into secure_url
    // e.g. .../image/upload/f_auto,q_auto/...
    const optimizeUrl = (url: string) =>
      url.replace("/image/upload/", "/image/upload/f_auto,q_auto/");

    const images: GposeImage[] = result.resources.map(
      (resource: CloudinaryResource) => ({
        public_id: resource.public_id,
        secure_url: optimizeUrl(resource.secure_url),
        width: resource.width,
        height: resource.height,
        title: resource.context?.custom?.title || "Untitled",
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
