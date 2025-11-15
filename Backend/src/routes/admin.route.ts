import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminOnly } from "../middlewares/role.middleware";
import {
  getAllSites,
  addSite,
  updateSite,
  getTeamForSite,
  addTeamMember,
  deleteSite,
  verifyTree,
} from "../controllers/admin.controller";

const router = Router();

router.use(authMiddleware, adminOnly);

router.get("/sites", getAllSites);
router.post("/sites/add", addSite);
router.put("/sites/:siteId", updateSite);
router.delete("/sites/:siteId", deleteSite);
router.get("/site/team", getTeamForSite);
router.post("/site/team/add", addTeamMember);
router.patch("/verify/:treeId", verifyTree);

export default router;
