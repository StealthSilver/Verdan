import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { adminOnly } from "../middlewares/role.middleware";
import {
  getAllSites,
  addSite,
  updateSite,
  getTeamForSite,
  addTeamMember,
  removeTeamMember,
  deleteSite,
  verifyTree,
  getSiteById,
  getTreesBySite,
  getTreeById,
  addTree,
  updateTree,
  addTreeRecord,
  deleteTreeRecord,
  deleteTree,
  resetDatabase,
} from "../controllers/admin.controller";

const router = Router();

// Log all requests for debugging (before auth to see all requests)
router.use((req, res, next) => {
  console.log(`Admin route hit: ${req.method} ${req.path}`);
  console.log(
    `Headers:`,
    req.headers.authorization ? "Authorization present" : "No Authorization"
  );
  next();
});

// Lightweight route list (kept BEFORE auth to diagnose 404 in production)
router.get("/_debug/routes", (req, res) => {
  try {
    const stack = (router as any).stack || [];
    const routes = stack
      .filter((layer: any) => layer.route)
      .map((layer: any) => {
        const methods = Object.keys(layer.route.methods)
          .filter((m) => layer.route.methods[m])
          .map((m) => m.toUpperCase());
        return { path: layer.route.path, methods };
      });
    res.json({ count: routes.length, routes });
  } catch (e) {
    res
      .status(500)
      .json({ message: "Failed to enumerate routes", error: String(e) });
  }
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
router.delete("/site/team/remove", removeTeamMember);
router.post("/trees/add", addTree);
router.post("/trees/:treeId/records", addTreeRecord);
router.delete("/trees/:treeId/records/:recordId", deleteTreeRecord);
// Alias route (singular 'record') in case frontend or cached code hits this path
router.delete("/trees/:treeId/record/:recordId", deleteTreeRecord);
router.get("/trees/:treeId", getTreeById);
router.put("/trees/:treeId", updateTree);
router.delete("/trees/:treeId", deleteTree);
router.patch("/verify/:treeId", verifyTree);
router.post("/reset-database", resetDatabase);

export default router;
