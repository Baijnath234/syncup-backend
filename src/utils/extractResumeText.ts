export const extractResumeText = async (file: Express.Multer.File) => {
  const rawText = file.buffer.toString("utf8");

  if (file.mimetype === "text/plain") {
    return rawText.trim();
  }

  return rawText
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 12000);
};
