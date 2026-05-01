import { Router } from "express";
import { getRecordDetails } from "../controllers/detailsController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/:type/:id", requireAuth(["student", "alumni"]), getRecordDetails);

export default router;
