const MAX_SIZE = 5 * 1024 * 1024;

const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "video/mp4",
  "audio/mpeg",
  "application/pdf"
];

export function validateMms(file: File) {
  const okType = ALLOWED.includes(file.type);
  const okSize = file.size <= MAX_SIZE;
  return {
    ok: okType && okSize,
    okType,
    okSize,
    type: file.type,
    size: file.size
  };
}
