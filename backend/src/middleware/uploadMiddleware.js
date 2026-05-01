import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";

const uploadsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../uploads"
);

function ensureFolder(folderName) {
  const folderPath = path.join(uploadsRoot, folderName);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  return folderPath;
}

// The destination is driven by the current field so one route can handle
// profile photos and resumes without extra branching.
const storage = multer.diskStorage({
  destination(_req, file, callback) {
    const folderName = file.fieldname === "resume" ? "resumes" : "profile_photos";
    callback(null, ensureFolder(folderName));
  },
  filename(_req, file, callback) {
    const extension = path.extname(file.originalname);
    const baseName =
      file.fieldname === "resume" ? "resume" : "profile_photo";
    callback(null, `${baseName}_${Date.now()}${extension}`);
  },
});

export const upload = multer({ storage });
