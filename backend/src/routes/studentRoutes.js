import { Router } from "express";
import {
  applyToJob,
  getStudentPortal,
  markStudentNotificationsRead,
  registerForEvent,
  updateStudentProfile,
} from "../controllers/studentController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = Router();

router.use(requireAuth(["student"]));
router.get("/portal", getStudentPortal);
router.post("/jobs/:jobId/apply", applyToJob);
router.post("/events/:eventId/register", registerForEvent);
router.patch("/notifications/read-all", markStudentNotificationsRead);
router.patch(
  "/profile",
  upload.fields([
    { name: "profile_photo", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  updateStudentProfile
);

export default router;
