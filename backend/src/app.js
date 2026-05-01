import cors from "cors";
import express from "express";
import fs from "node:fs";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import alumniRoutes from "./routes/alumniRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import detailsRoutes from "./routes/detailsRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";

export function createApp() {
  const app = express();
  const rootPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../.."
  );
  const uploadsPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../uploads"
  );
  const clientDistPath = path.resolve(rootPath, "../frontend/dist");

  function isAllowedOrigin(origin) {
    if (!origin) {
      return true;
    }

    if (env.clientUrls.includes(origin)) {
      return true;
    }

    // Keep local development flexible across common localhost ports.
    return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
  }

  app.use(
    cors({
      origin(origin, callback) {
        // Allow same-origin server requests, local dev clients, and non-browser tools.
        if (isAllowedOrigin(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("CORS origin is not allowed."));
      },
    })
  );
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static(uploadsPath));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/student", studentRoutes);
  app.use("/api/alumni", alumniRoutes);
  app.use("/api/details", detailsRoutes);

  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));

    app.get(/^(?!\/api|\/uploads).*/, (_req, res) => {
      res.sendFile(path.join(clientDistPath, "index.html"));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
