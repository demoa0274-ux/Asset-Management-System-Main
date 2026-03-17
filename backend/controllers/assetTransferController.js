const asyncHandler = require("express-async-handler");
const db = require("../models");
const { sendError, sendSuccess } = require("../utils/response");
const { logAssetChange } = require("../utils/assetHistoryLogger");

const sectionConfigMap = {
  // hardware
  desktop: { model: () => db.BranchDesktop, pk: "id" },
  laptop: { model: () => db.BranchLaptop, pk: "id" },
  printer: { model: () => db.BranchPrinter, pk: "id" },
  scanner: { model: () => db.BranchScanner, pk: "id" },
  projector: { model: () => db.BranchProjector, pk: "id" },
  panel: { model: () => db.BranchPanel, pk: "id" },
  ipphone: { model: () => db.BranchIpPhone, pk: "id" },
  cctv: { model: () => db.BranchCctv, pk: "cctv_id" },
  server: { model: () => db.BranchServer, pk: "id" },
  firewall_router: { model: () => db.BranchFirewallRouter, pk: "id" },
  switch: { model: () => db.BranchSwitch, pk: "id" },
  // software/services/licenses/windows
  application_software: { model: () => db.BranchApplicationSoftware, pk: "id" },
  office_software: { model: () => db.BranchOfficeSoftware, pk: "id" },
  utility_software: { model: () => db.BranchUtilitySoftware, pk: "id" },
  security_software: { model: () => db.BranchSecuritySoftware, pk: "id" },
  security_software_installed: { model: () => db.BranchSecuritySoftwareInstalled, pk: "id" },
  services: { model: () => db.BranchServices, pk: "id" },
  licenses: { model: () => db.BranchLicenses, pk: "id" },
  windows_os: { model: () => db.BranchWindowsOS, pk: "id" },
  windows_servers: { model: () => db.BranchWindowsServers, pk: "id" },
};

const allowedSections = new Set(Object.keys(sectionConfigMap));

exports.transferAsset = asyncHandler(async (req, res) => {
  const { section, assetId, fromBranchId, toBranchId, remarks, transferredBy } = req.body;

  const key = String(section || "").trim().toLowerCase();

  if (!allowedSections.has(key)) {
    return sendError(
      res,
      `Invalid section for transfer. Allowed: ${Array.from(allowedSections).join(", ")}`,
      400
    );
  }

  const cfg = sectionConfigMap[key];
  const Model = cfg?.model?.();
  const pk = cfg?.pk || "id";

  if (!Model) {
    return sendError(res, "Model not found for section", 500);
  }

  const aId = Number(assetId);
  const fromId = Number(fromBranchId);
  const toId = Number(toBranchId);

  if (!Number.isFinite(aId) || !Number.isFinite(fromId) || !Number.isFinite(toId)) {
    return sendError(res, "assetId/fromBranchId/toBranchId must be valid numbers", 400);
  }

  if (fromId === toId) {
    return sendError(res, "Target branch must be different", 400);
  }

  if (db.Branch) {
    const [fromBranch, toBranch] = await Promise.all([
      db.Branch.findByPk(fromId),
      db.Branch.findByPk(toId),
    ]);

    if (!fromBranch) return sendError(res, "Source branch not found", 404);
    if (!toBranch) return sendError(res, "Target branch not found", 404);
  }

  const whereClause = {
    [pk]: aId,
    branchId: fromId,
  };

  const asset = await Model.findOne({ where: whereClause });

  if (!asset) {
    return sendError(res, `Asset not found in source branch for section "${key}"`, 404);
  }

  const oldData = asset.toJSON();

  await asset.update({
    branchId: toId,
    remarks: remarks ?? asset.remarks,
  });

  const newData = asset.toJSON();

  const assetCode =
    asset.assetId ||
    asset.assetCode ||
    `${key.toUpperCase()}-${aId}`;

  if (db.AssetTransfer) {
    await db.AssetTransfer.create({
      assetCode,
      section: key,
      assetId: aId,
      fromBranchId: fromId,
      toBranchId: toId,
      reason: remarks ?? null,
      transferredBy: transferredBy ?? req.user?.name ?? null,
    });
  }

  const user = req.user || {
    id: null,
    name: transferredBy || "System",
    username: transferredBy || "system",
  };

  await logAssetChange(fromId, aId, key, oldData, newData, user, "TRANSFER");
  await logAssetChange(toId, aId, key, oldData, newData, user, "TRANSFER");

  return sendSuccess(
    res,
    {
      section: key,
      assetCode,
      transferredAsset: asset,
      fromBranchId: fromId,
      toBranchId: toId,
    },
    "Asset transferred successfully"
  );
});

exports.getAssetTransferHistory = asyncHandler(async (req, res) => {
  const {
    assetId,
    section,
    limit = 100,
    offset = 0,
  } = req.query;

  const where = {};

  if (assetId !== undefined && assetId !== null && assetId !== "") {
    where.assetId = Number(assetId);
  }

  if (section) {
    where.section = String(section).trim().toLowerCase();
  }

  const transfers = await db.AssetTransfer.findAll({
    where,
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit, 10) || 100,
    offset: parseInt(offset, 10) || 0,
  });

  const total = await db.AssetTransfer.count({ where });

  return sendSuccess(
    res,
    {
      transfers,
      total,
      limit: parseInt(limit, 10) || 100,
      offset: parseInt(offset, 10) || 0,
    },
    "Transfer history retrieved"
  );
});