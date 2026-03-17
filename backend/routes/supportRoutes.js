// backend/routes/supportRoutes.js
const express = require("express");
const asyncHandler = require("express-async-handler");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { sequelize } = require("../config/db");
const { DataTypes } = require("sequelize");

// ---------- role helpers ----------
const normRole = (role) =>
  String(role || "").toLowerCase().replace(/[\s_-]/g, "").trim();

const isAdmin = (req) => normRole(req.user?.role) === "admin";
const isSubAdmin = (req) => normRole(req.user?.role) === "subadmin";
const isUser = (req) => {
  const r = normRole(req.user?.role);
  return r === "user" || r === "";
};

// ---------- Models (same file, simple) ----------
const SupportTicket = sequelize.define(
  "SupportTicket",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    subject: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM("Open", "In Progress", "Resolved", "Forwarded"),
      defaultValue: "Open",
    },

    assigned_to_role: {
      type: DataTypes.ENUM("subadmin", "admin"),
      allowNull: false,
      defaultValue: "subadmin",
    },
    forwarded_remark: { type: DataTypes.TEXT, allowNull: true },
    forwarded_by_email: { type: DataTypes.STRING, allowNull: true },
    forwarded_at: { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: "support_tickets", timestamps: true, createdAt: "created_at", updatedAt: false }
);

const SupportReply = sequelize.define(
  "SupportReply",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    ticket_id: { type: DataTypes.INTEGER, allowNull: false },
    sender_role: {
      type: DataTypes.ENUM("user", "subadmin", "admin"),
      allowNull: false,
      defaultValue: "subadmin",
    },
    message: { type: DataTypes.TEXT, allowNull: false },
  },
  { tableName: "support_replies", timestamps: true, createdAt: "created_at", updatedAt: false }
);

SupportTicket.hasMany(SupportReply, { foreignKey: "ticket_id", as: "replies" });
SupportReply.belongsTo(SupportTicket, { foreignKey: "ticket_id", as: "ticket" });

// ---------- ROUTES ----------

// USER creates ticket -> always assigned to subadmin
router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const ticket = await SupportTicket.create({
      name,
      email,
      subject,
      message,
      status: "Open",
      assigned_to_role: "subadmin",
    });

    res.status(201).json({ message: "Ticket submitted", ticket });
  })
);

// USER views own tickets
router.get(
  "/my",
  protect,
  asyncHandler(async (req, res) => {
    const email = req.user?.email;
    if (!email) return res.status(400).json({ message: "User email not found" });

    const tickets = await SupportTicket.findAll({
      where: { email },
      order: [["created_at", "DESC"]],
    });

    res.json(tickets);
  })
);

// STAFF list
// SubAdmin sees only assigned_to_role=subadmin
// Admin sees only assigned_to_role=admin
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    if (isSubAdmin(req)) {
      const tickets = await SupportTicket.findAll({
        where: { assigned_to_role: "subadmin" },
        order: [["created_at", "DESC"]],
      });
      return res.json(tickets);
    }

    if (isAdmin(req)) {
      const tickets = await SupportTicket.findAll({
        where: { assigned_to_role: "admin" },
        order: [["created_at", "DESC"]],
      });
      return res.json(tickets);
    }

    return res.status(403).json({ message: "Not authorized" });
  })
);

// View ticket + replies with access control
router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (isUser(req)) {
      if (ticket.email !== req.user?.email) return res.status(403).json({ message: "Not authorized" });
    } else if (isSubAdmin(req)) {
      if (ticket.assigned_to_role !== "subadmin") return res.status(403).json({ message: "Not authorized" });
    } else if (isAdmin(req)) {
      if (ticket.assigned_to_role !== "admin") return res.status(403).json({ message: "Not authorized" });
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }

    const replies = await SupportReply.findAll({
      where: { ticket_id: ticket.id },
      order: [["created_at", "ASC"]],
    });

    res.json({ ticket, replies });
  })
);

// USER edits own ticket (optional but you already had it)
router.patch(
  "/:id/edit",
  protect,
  asyncHandler(async (req, res) => {
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ message: "Subject and message are required" });

    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (!isUser(req) || ticket.email !== req.user?.email) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (ticket.status === "Resolved") {
      return res.status(400).json({ message: "Resolved ticket cannot be edited" });
    }

    await ticket.update({ subject, message });
    res.json({ message: "Ticket updated", ticket });
  })
);

// SubAdmin/Admin reply
router.post(
  "/:id/reply",
  protect,
  asyncHandler(async (req, res) => {
    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ message: "Reply message required" });

    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (isSubAdmin(req)) {
      if (ticket.assigned_to_role !== "subadmin") return res.status(403).json({ message: "Not authorized" });

      await SupportReply.create({ ticket_id: ticket.id, sender_role: "subadmin", message });
      if (ticket.status === "Open") await ticket.update({ status: "In Progress" });

      return res.status(201).json({ message: "Reply sent" });
    }

    if (isAdmin(req)) {
      if (ticket.assigned_to_role !== "admin") return res.status(403).json({ message: "Not authorized" });

      await SupportReply.create({ ticket_id: ticket.id, sender_role: "admin", message });
      if (ticket.status === "Open" || ticket.status === "Forwarded") await ticket.update({ status: "In Progress" });

      return res.status(201).json({ message: "Reply sent" });
    }

    return res.status(403).json({ message: "Not authorized" });
  })
);

// SubAdmin forward to admin with remark (required)
router.post(
  "/:id/forward",
  protect,
  asyncHandler(async (req, res) => {
    if (!isSubAdmin(req)) return res.status(403).json({ message: "SubAdmin only" });

    const { remark } = req.body;
    if (!remark || !remark.trim()) return res.status(400).json({ message: "Remark is required" });

    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (ticket.assigned_to_role !== "subadmin") return res.status(403).json({ message: "Not authorized" });

    await ticket.update({
      assigned_to_role: "admin",
      status: "Forwarded",
      forwarded_remark: remark.trim(),
      forwarded_by_email: req.user?.email || null,
      forwarded_at: new Date(),
    });

    await SupportReply.create({
      ticket_id: ticket.id,
      sender_role: "subadmin",
      message: `FORWARDED TO ADMIN: ${remark.trim()}`,
    });

    res.json({ message: "Forwarded to Admin", ticket });
  })
);

// Staff status update
router.put(
  "/:id/status",
  protect,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const allowed = ["Open", "In Progress", "Resolved", "Forwarded"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    if (isSubAdmin(req)) {
      if (ticket.assigned_to_role !== "subadmin") return res.status(403).json({ message: "Not authorized" });
      if (status === "Forwarded") return res.status(400).json({ message: "Use Forward button" });
      await ticket.update({ status });
      return res.json({ message: "Status updated", ticket });
    }

    if (isAdmin(req)) {
      if (ticket.assigned_to_role !== "admin") return res.status(403).json({ message: "Not authorized" });
      await ticket.update({ status });
      return res.json({ message: "Status updated", ticket });
    }

    return res.status(403).json({ message: "Not authorized" });
  })
);

// Admin delete
router.delete(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ message: "Admin only" });

    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    await SupportReply.destroy({ where: { ticket_id: ticket.id } });
    await ticket.destroy();

    res.json({ message: "Ticket deleted successfully" });
  })
);

module.exports = router;
