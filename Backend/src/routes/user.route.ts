import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getUserDashboard,
  getUserProfile,
  getSiteDashboard,
  getTreeDetails,
  addTree,
  getAssignedSites,
  getSiteTrees,
  updateTree,
  deleteTree,
  getSiteTree,
  createTreeInSite,
  addTreeRecordInSite,
  deleteTreeRecordInSite,
} from "../controllers/user.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/dashboard", getUserDashboard);
router.get("/profile", getUserProfile);
router.get("/site/dashboard", getSiteDashboard);
router.get("/site/dashboard/:treeId", getTreeDetails);
router.post("/site/dashboard/add", addTree);

// New: assigned sites and site-scoped tree CRUD
router.get("/sites/assigned", getAssignedSites);
router.get("/sites/:siteId/trees", getSiteTrees);
router.put("/sites/:siteId/trees/:treeId", updateTree);
router.delete("/sites/:siteId/trees/:treeId", deleteTree);
// Parity endpoints for single tree & records
router.get("/sites/:siteId/trees/:treeId", getSiteTree);
router.post("/sites/:siteId/trees", createTreeInSite);
router.post("/sites/:siteId/trees/:treeId/records", addTreeRecordInSite);
router.delete(
  "/sites/:siteId/trees/:treeId/records/:recordId",
  deleteTreeRecordInSite
);

export default router;
