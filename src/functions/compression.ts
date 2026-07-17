import pako from "pako";

/**
 * JSON-stringify, gzip, and base64-encode a value for OBR broadcast.
 * Inverse of decompressFromB64String.
 */
export const compressToB64String = (data: unknown): string => {
  const stringified = JSON.stringify(data);
  const compressed = pako.gzip(stringified);
  // Build the binary string in chunks; spreading the whole array into
  // String.fromCharCode overflows the argument limit on large payloads.
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < compressed.length; i += chunkSize) {
    binary += String.fromCharCode(...compressed.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

/**
 * Decode a base64 string, un-gzip it, and parse the JSON back out.
 * Inverse of compressToB64String.
 */
export const decompressFromB64String = <T>(b64: string): T => {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return JSON.parse(pako.ungzip(bytes, { to: "string" })) as T;
};
