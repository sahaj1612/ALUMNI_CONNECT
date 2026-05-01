import dotenv from "dotenv";

dotenv.config();

function parseClientUrls() {
  const configured = process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:5173";

  return configured
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export const env = {
  port: Number(process.env.PORT || 5000),
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/alumniConnectDB",
  jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
  clientUrls: parseClientUrls(),
};
