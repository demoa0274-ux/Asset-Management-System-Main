// backend/routes/branchRoutes.js
const express = require("express");
const router = express.Router();

const branchController = require("../controllers/branchContoller");
const { protect } = require("../middleware/authMiddleware");
const { adminOrSubadmin, adminOnly } = require("../middleware/adminMiddleware");

router.get("/with-assets/all", protect, branchController.getBranchesWithAssets);

router.get("/:id/assets-summary", protect, branchController.getBranchAssetsSummary);
router.post("/ping", protect, branchController.pingDevice);

router.get("/", protect, branchController.getBranches);
router.get("/:id", protect, branchController.getBranchById);

router.post("/", protect, adminOrSubadmin, branchController.createBranch);
router.put("/:id", protect, adminOrSubadmin, branchController.updateBranch);
router.delete("/:id", protect, adminOnly, branchController.deleteBranch);

router.put("/:id/infra", protect, adminOrSubadmin, branchController.updateInfra);
router.put("/:id/connectivity", protect, adminOrSubadmin, branchController.updateConnectivity);
router.put("/:id/ups", protect, adminOrSubadmin, branchController.updateUps);

router.get("/:id/scanners", protect, branchController.scanners.list);
router.post("/:id/scanners", protect, adminOrSubadmin, branchController.scanners.create);
router.put("/:id/scanners/:rowId", protect, adminOrSubadmin, branchController.scanners.update);
router.delete("/:id/scanners/:rowId", protect, adminOrSubadmin, branchController.scanners.remove);

router.get("/:id/projectors", protect, branchController.projectors.list);
router.post("/:id/projectors", protect, adminOrSubadmin, branchController.projectors.create);
router.put("/:id/projectors/:rowId", protect, adminOrSubadmin, branchController.projectors.update);
router.delete("/:id/projectors/:rowId", protect, adminOrSubadmin, branchController.projectors.remove);

router.get("/:id/printers", protect, branchController.printers.list);
router.post("/:id/printers", protect, adminOrSubadmin, branchController.printers.create);
router.put("/:id/printers/:rowId", protect, adminOrSubadmin, branchController.printers.update);
router.delete("/:id/printers/:rowId", protect, adminOrSubadmin, branchController.printers.remove);

router.get("/:id/desktops", protect, branchController.desktops.list);
router.post("/:id/desktops", protect, adminOrSubadmin, branchController.desktops.create);
router.put("/:id/desktops/:rowId", protect, adminOrSubadmin, branchController.desktops.update);
router.delete("/:id/desktops/:rowId", protect, adminOrSubadmin, branchController.desktops.remove);

router.get("/:id/laptops", protect, branchController.laptops.list);
router.post("/:id/laptops", protect, adminOrSubadmin, branchController.laptops.create);
router.put("/:id/laptops/:rowId", protect, adminOrSubadmin, branchController.laptops.update);
router.delete("/:id/laptops/:rowId", protect, adminOrSubadmin, branchController.laptops.remove);

router.get("/:id/cctvs", protect, branchController.cctvs.list);
router.post("/:id/cctvs", protect, adminOrSubadmin, branchController.cctvs.create);
router.put("/:id/cctvs/:rowId", protect, adminOrSubadmin, branchController.cctvs.update);
router.delete("/:id/cctvs/:rowId", protect, adminOrSubadmin, branchController.cctvs.remove);

router.get("/cctvs/:cctvId/cameras", protect, branchController.cameras.list);
router.post("/cctvs/:cctvId/cameras", protect, adminOrSubadmin, branchController.cameras.create);
router.put("/cctvs/:cctvId/cameras/:cameraId", protect, adminOrSubadmin, branchController.cameras.update);
router.delete("/cctvs/:cctvId/cameras/:cameraId", protect, adminOrSubadmin, branchController.cameras.remove);

router.get("/:id/panels", protect, branchController.panels.list);
router.post("/:id/panels", protect, adminOrSubadmin, branchController.panels.create);
router.put("/:id/panels/:rowId", protect, adminOrSubadmin, branchController.panels.update);
router.delete("/:id/panels/:rowId", protect, adminOrSubadmin, branchController.panels.remove);

router.get("/:id/ipphones", protect, branchController.ipphones.list);
router.post("/:id/ipphones", protect, adminOrSubadmin, branchController.ipphones.create);
router.put("/:id/ipphones/:rowId", protect, adminOrSubadmin, branchController.ipphones.update);
router.delete("/:id/ipphones/:rowId", protect, adminOrSubadmin, branchController.ipphones.remove);

router.get("/:id/servers", protect, branchController.servers.list);
router.post("/:id/servers", protect, adminOrSubadmin, branchController.servers.create);
router.put("/:id/servers/:rowId", protect, adminOrSubadmin, branchController.servers.update);
router.delete("/:id/servers/:rowId", protect, adminOrSubadmin, branchController.servers.remove);

router.get("/:id/firewall-routers", protect, branchController.firewallRouters.list);
router.post("/:id/firewall-routers", protect, adminOrSubadmin, branchController.firewallRouters.create);
router.put("/:id/firewall-routers/:rowId", protect, adminOrSubadmin, branchController.firewallRouters.update);
router.delete("/:id/firewall-routers/:rowId", protect, adminOrSubadmin, branchController.firewallRouters.remove);

/* EXTRA ASSETS */
router.get("/:id/switches", protect, branchController.switches.list);
router.post("/:id/switches", protect, adminOrSubadmin, branchController.switches.create);
router.put("/:id/switches/:rowId", protect, adminOrSubadmin, branchController.switches.update);
router.delete("/:id/switches/:rowId", protect, adminOrSubadmin, branchController.switches.remove);

/* EXTRA MONITORS */
router.get("/:id/extra-monitors", protect, branchController.extraMonitors.list);
router.post("/:id/extra-monitors", protect, adminOrSubadmin, branchController.extraMonitors.create);
router.put("/:id/extra-monitors/:rowId", protect, adminOrSubadmin, branchController.extraMonitors.update);
router.delete("/:id/extra-monitors/:rowId", protect, adminOrSubadmin, branchController.extraMonitors.remove);

// aliases
router.get("/:id/extra-monitor", protect, branchController.extraMonitors.list);
router.post("/:id/extra-monitor", protect, adminOrSubadmin, branchController.extraMonitors.create);
router.put("/:id/extra-monitor/:rowId", protect, adminOrSubadmin, branchController.extraMonitors.update);
router.delete("/:id/extra-monitor/:rowId", protect, adminOrSubadmin, branchController.extraMonitors.remove);

router.get("/:id/extra_monitors", protect, branchController.extraMonitors.list);
router.post("/:id/extra_monitors", protect, adminOrSubadmin, branchController.extraMonitors.create);
router.put("/:id/extra_monitors/:rowId", protect, adminOrSubadmin, branchController.extraMonitors.update);
router.delete("/:id/extra_monitors/:rowId", protect, adminOrSubadmin, branchController.extraMonitors.remove);

router.get("/:id/application-software", protect, branchController.applicationSoftware.list);
router.post("/:id/application-software", protect, adminOrSubadmin, branchController.applicationSoftware.create);
router.put("/:id/application-software/:rowId", protect, adminOrSubadmin, branchController.applicationSoftware.update);
router.delete("/:id/application-software/:rowId", protect, adminOrSubadmin, branchController.applicationSoftware.remove);

router.get("/:id/office-software", protect, branchController.officeSoftware.list);
router.post("/:id/office-software", protect, adminOrSubadmin, branchController.officeSoftware.create);
router.put("/:id/office-software/:rowId", protect, adminOrSubadmin, branchController.officeSoftware.update);
router.delete("/:id/office-software/:rowId", protect, adminOrSubadmin, branchController.officeSoftware.remove);

router.get("/:id/security-software", protect, branchController.securitySoftware.list);
router.post("/:id/security-software", protect, adminOrSubadmin, branchController.securitySoftware.create);
router.put("/:id/security-software/:rowId", protect, adminOrSubadmin, branchController.securitySoftware.update);
router.delete("/:id/security-software/:rowId", protect, adminOrSubadmin, branchController.securitySoftware.remove);

router.get("/:id/security-software-installed", protect, branchController.securitySoftwareInstalled.list);
router.post(
  "/:id/security-software-installed",
  protect,
  adminOrSubadmin,
  branchController.securitySoftwareInstalled.create
);
router.put(
  "/:id/security-software-installed/:rowId",
  protect,
  adminOrSubadmin,
  branchController.securitySoftwareInstalled.update
);
router.delete(
  "/:id/security-software-installed/:rowId",
  protect,
  adminOrSubadmin,
  branchController.securitySoftwareInstalled.remove
);

router.get("/:id/utility-software", protect, branchController.utilitySoftware.list);
router.post("/:id/utility-software", protect, adminOrSubadmin, branchController.utilitySoftware.create);
router.put("/:id/utility-software/:rowId", protect, adminOrSubadmin, branchController.utilitySoftware.update);
router.delete("/:id/utility-software/:rowId", protect, adminOrSubadmin, branchController.utilitySoftware.remove);

router.get("/:id/services", protect, branchController.services.list);
router.post("/:id/services", protect, adminOrSubadmin, branchController.services.create);
router.put("/:id/services/:rowId", protect, adminOrSubadmin, branchController.services.update);
router.delete("/:id/services/:rowId", protect, adminOrSubadmin, branchController.services.remove);

router.get("/:id/licenses", protect, branchController.licenses.list);
router.post("/:id/licenses", protect, adminOrSubadmin, branchController.licenses.create);
router.put("/:id/licenses/:rowId", protect, adminOrSubadmin, branchController.licenses.update);
router.delete("/:id/licenses/:rowId", protect, adminOrSubadmin, branchController.licenses.remove);

router.get("/:id/windows-os", protect, branchController.windowsOS.list);
router.post("/:id/windows-os", protect, adminOrSubadmin, branchController.windowsOS.create);
router.put("/:id/windows-os/:rowId", protect, adminOrSubadmin, branchController.windowsOS.update);
router.delete("/:id/windows-os/:rowId", protect, adminOrSubadmin, branchController.windowsOS.remove);

router.get("/:id/windows-servers", protect, branchController.windowsServers.list);
router.post("/:id/windows-servers", protect, adminOrSubadmin, branchController.windowsServers.create);
router.put("/:id/windows-servers/:rowId", protect, adminOrSubadmin, branchController.windowsServers.update);
router.delete("/:id/windows-servers/:rowId", protect, adminOrSubadmin, branchController.windowsServers.remove);

module.exports = router;