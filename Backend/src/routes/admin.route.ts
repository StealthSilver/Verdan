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
  getSiteById,
  getTreesBySite,
  getTreeById,
  addTree,
  updateTree,
  addTreeRecord,
  deleteTree,
  resetDatabase,
} from "../controllers/admin.controller";

const router = Router();

// Log all requests for debugging (before auth to see all requests)
router.use((req, res, next) => {
  console.log(`Admin route hit: ${req.method} ${req.path}`);
  console.log(`Headers:`, req.headers.authorization ? "Authorization present" : "No Authorization");
  next();
});

router.use(authMiddleware, adminOnly);

router.get("/sites", getAllSites);
router.get("/sites/:siteId/trees", getTreesBySite);
router.get("/sites/:siteId", getSiteById);
router.post("/sites/add", addSite);
router.put("/sites/:siteId", updateSite);
router.delete("/sites/:siteId", deleteSite);
router.get("/site/team", getTeamForSite);
router.post("/site/team/add", addTeamMember);
router.post("/trees/add", addTree);
router.get("/trees/:treeId", getTreeById);
router.put("/trees/:treeId", updateTree);
router.post("/trees/:treeId/records", addTreeRecord);
router.delete("/trees/:treeId", deleteTree);
router.patch("/verify/:treeId", verifyTree);
router.post("/reset-database", resetDatabase);

export default router;
