import { Router } from "express";
import { getPublicTreeById } from "../controllers/public.controller";

const router = Router();

// Public route - no authentication required
router.get("/trees/:treeId", getPublicTreeById);

export default router;
