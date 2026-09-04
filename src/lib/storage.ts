import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

// Storage abstraction interface
export interface StorageService {
  uploadImage(file: any, fileName: string): Promise<{ url: string; publicId: string }>;
  deleteImage(publicId: string): Promise<boolean>;
}

/**
 * Safely extracts a Node Buffer and MimeType from any file object (File, Blob, Buffer, or Data URL)
 * across both browser-like and Node.js serverless runtimes.
 */
async function getBufferAndMime(file: any): Promise<{ buffer: Buffer; mimeType: string }> {
  if (Buffer.isBuffer(file)) {
    return { buffer: file, mimeType: "image/jpeg" };
  }
  if (file && typeof file.arrayBuffer === "function") {
    const arrayBuffer = await file.arrayBuffer();
    const mimeType = file.type || "image/jpeg";
    return { buffer: Buffer.from(arrayBuffer), mimeType };
  }
  if (typeof file === "string" && file.startsWith("data:")) {
    const matches = file.match(/^data:(.+);base64,(.+)$/);
    if (matches) {
      return { buffer: Buffer.from(matches[2], "base64"), mimeType: matches[1] };
    }
  }
  // Fallback if file is object with buffer/stream
  if (file && file.buffer && Buffer.isBuffer(file.buffer)) {
    return { buffer: file.buffer, mimeType: file.mimetype || "image/jpeg" };
  }
  throw new Error("Unable to extract buffer from uploaded file object");
}

// Local Disk Storage Service Implementation (with base64 Data URL fallback for Vercel/serverless)
class LocalStorageService implements StorageService {
  private uploadDir = path.join(process.cwd(), "public", "uploads");

  constructor() {
    try {
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
    } catch {
      // Ignore directory creation failure on read-only environments like Vercel
    }
  }

  async uploadImage(file: any, fileName: string): Promise<{ url: string; publicId: string }> {
    const { buffer, mimeType } = await getBufferAndMime(file);

    try {
      const extension = (fileName || "image.jpg").split(".").pop() || "jpg";
      const uniqueName = `${Math.random().toString(36).substring(2, 9)}-${Date.now()}.${extension}`;
      const filePath = path.join(this.uploadDir, uniqueName);

      await fs.promises.writeFile(filePath, buffer);
      
      const url = `/uploads/${uniqueName}`;
      return { url, publicId: uniqueName };
    } catch (error) {
      console.warn("Local disk write failed (serverless environment), falling back to base64 Data URL:", error);
      const dataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
      const uniqueId = `inline-${Date.now()}`;
      return { url: dataUrl, publicId: uniqueId };
    }
  }

  async deleteImage(publicId: string): Promise<boolean> {
    try {
      if (publicId.startsWith("inline-")) return true;
      const filePath = path.join(this.uploadDir, publicId);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Local storage delete error:", error);
      return false;
    }
  }
}

// Cloudinary Storage Service Implementation (for production with Cloudinary keys)
class CloudinaryStorageService implements StorageService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: any, fileName: string): Promise<{ url: string; publicId: string }> {
    try {
      const { buffer, mimeType } = await getBufferAndMime(file);

      // Convert buffer to base64 data URL for Cloudinary upload
      const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;

      const uploadResult = await cloudinary.uploader.upload(base64Data, {
        folder: "rent-a-house",
        resource_type: "auto",
      });

      return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error("Failed to upload file to Cloudinary");
    }
  }

  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === "ok";
    } catch (error) {
      console.error("Cloudinary delete error:", error);
      return false;
    }
  }
}

// Select active storage service based on environment variables
const hasCloudinaryCredentials =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

export const storageService: StorageService = hasCloudinaryCredentials
  ? new CloudinaryStorageService()
  : new LocalStorageService();
