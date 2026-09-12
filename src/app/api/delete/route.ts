import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { cookies } from "next/headers";

export async function DELETE(request: NextRequest) {
  // Auth check
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const public_ids: string[] = Array.isArray(body.public_ids)
      ? body.public_ids
      : body.public_id
      ? [body.public_id]
      : [];

    if (public_ids.length === 0) {
      return NextResponse.json(
        { error: "No public_id or public_ids provided" },
        { status: 400 }
      );
    }

    await Promise.all(public_ids.map((id) => cloudinary.uploader.destroy(id)));

    return NextResponse.json({ success: true, count: public_ids.length });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
