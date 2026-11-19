import { v2 as cloudinary } from "cloudinary";
import { isCloudinaryConfigured } from "@/infrastructure/config/env";

export interface SignedUploadPayload {
  mode: "cloudinary" | "sandbox";
  cloudName: string | null;
  apiKey: string | null;
  timestamp: number;
  signature: string | null;
  folder: string;
}

export function generateCloudinaryUploadSignature(
  studioSlug: string,
  projectSlug: string
): SignedUploadPayload {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `clientportal/${studioSlug}/${projectSlug}`;

  if (!isCloudinaryConfigured()) {
    return {
      mode: "sandbox",
      cloudName: null,
      apiKey: null,
      timestamp,
      signature: null,
      folder,
    };
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
    },
    apiSecret
  );

  return {
    mode: "cloudinary",
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
  };
}
