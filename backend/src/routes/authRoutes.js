import { Router } from "express";
import {
  getCurrentUser,
  loginAlumni,
  loginStudent,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/student/login", loginStudent);
router.post("/alumni/login", loginAlumni);
router.get("/me", requireAuth(["student", "alumni"]), getCurrentUser);

export default router;
