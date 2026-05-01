import { Router } from "express";
import {
  createEvent,
  createJob,
  deleteEvent,
  deleteJob,
  getAlumniPortal,
  markAlumniNotificationsRead,
  updateAlumniProfile,
  updateApplicationStatus,
  updateEvent,
  updateJob,
} from "../controllers/alumniController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = Router();

router.use(requireAuth(["alumni"]));
router.get("/portal", getAlumniPortal);
router.post("/jobs", createJob);
router.patch("/jobs/:jobId", updateJob);
router.delete("/jobs/:jobId", deleteJob);
router.post("/events", createEvent);
router.patch("/events/:eventId", updateEvent);
router.delete("/events/:eventId", deleteEvent);
router.patch("/applications/:applicationId/status", updateApplicationStatus);
router.patch("/notifications/read-all", markAlumniNotificationsRead);
router.patch(
  "/profile",
  upload.fields([{ name: "profile_photo", maxCount: 1 }]),
  updateAlumniProfile
);

export default router;
