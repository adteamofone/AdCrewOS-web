import { put } from "@vercel/blob";

/**
 * Vercel Blob wrapper for logo uploads + generated PDFs.
 * Returns the public URL. Requires BLOB_READ_WRITE_TOKEN.
 */

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function uploadBlob(
  pathname: string,
  data: Buffer | Uint8Array | ArrayBuffer | Blob,
  contentType?: string,
): Promise<string> {
  if (!isBlobConfigured()) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not set");
  }
  const { url } = await put(pathname, data as Buffer | Blob, {
    access: "public",
    contentType,
    addRandomSuffix: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return url;
}
