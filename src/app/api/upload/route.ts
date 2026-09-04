import { NextResponse } from "next/server";
import { storageService } from "@/lib/storage";
import { getAuthenticatedUser } from "@/lib/auth";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif", "image/svg+xml"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    if (user.role === "USER") {
      return NextResponse.json(
        { error: "Access denied. Only admins, owners, or agents can upload files." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof (file as any).arrayBuffer !== "function") {
      return NextResponse.json(
        { error: "No valid file was uploaded." },
        { status: 400 }
      );
    }

    const uploadedFile = file as any;
    const fileName = uploadedFile.name || "uploaded_file.jpg";
    const fileType = uploadedFile.type || "image/jpeg";
    const fileSize = uploadedFile.size || 0;

    const isVideo = ALLOWED_VIDEO_TYPES.includes(fileType);
    const isImage = ALLOWED_IMAGE_TYPES.includes(fileType);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: `Invalid file type (${fileType}). Only JPEG/PNG/WEBP images are allowed.` },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (fileSize > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds the limit (${isVideo ? "50MB" : "10MB"}).` },
        { status: 400 }
      );
    }

    // Upload using storage service abstraction
    const uploadResult = await storageService.uploadImage(file, fileName);

    return NextResponse.json({
      message: "Image uploaded successfully",
      url: uploadResult.url,
      publicId: uploadResult.publicId,
    });
  } catch (error: any) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred during file upload." },
      { status: 500 }
    );
  }
}
