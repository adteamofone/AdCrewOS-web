import crypto from "crypto";

/**
 * AES-256-GCM encryption for OAuth tokens at rest.
 * Key: base64-encoded 32 bytes in TOKEN_ENCRYPTION_KEY.
 * Format: v1:<ivB64>:<tagB64>:<cipherB64>
 */

const VERSION = "v1";

function getKey(): Buffer {
  const raw = process.env.TOKEN_ENCRYPTION_KEY;
  if (!raw) {
    // Deterministic dev fallback so local/demo boots without config.
    // Production MUST set TOKEN_ENCRYPTION_KEY (32 random bytes, base64).
    if (process.env.NODE_ENV === "production") {
      throw new Error("TOKEN_ENCRYPTION_KEY is required in production");
    }
    return crypto.createHash("sha256").update("adcrewos-dev-key").digest();
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY must decode to 32 bytes (base64)");
  }
  return key;
}

export function encrypt(plaintext: string | null | undefined): string | null {
  if (plaintext == null || plaintext === "") return null;
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    VERSION,
    iv.toString("base64"),
    tag.toString("base64"),
    enc.toString("base64"),
  ].join(":");
}

export function decrypt(payload: string | null | undefined): string | null {
  if (payload == null || payload === "") return null;
  const parts = payload.split(":");
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new Error("Malformed ciphertext");
  }
  const [, ivB64, tagB64, dataB64] = parts;
  const key = getKey();
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivB64, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}
