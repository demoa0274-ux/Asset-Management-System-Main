// backend/jobs/expiryJob.js
const cron = require("node-cron");
const { Op } = require("sequelize");
const db = require("../models");
const { sendMail } = require("../utils/mailer");

const {
  Notification,
  BranchLicenses,
  BranchServices,
  BranchWindowsServers,
  BranchApplicationSoftware,
  BranchOfficeSoftware,
  BranchSecuritySoftware,
  BranchDesktop,
  BranchLaptop,
  BranchPrinter,
  BranchProjector,
  BranchUps,
  BranchPanel,
  BranchIpPhone,
  BranchServer,
  BranchFirewallRouter,
} = db;

function toDateOnly(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function buildUniqKey(entityType, entityId, dueDate, status) {
  return `${entityType}:${entityId}:${dueDate}:${status}`;
}

async function runExpiryCheck({ daysAhead = 3 } = {}) {
  const adminEmail = process.env.ADMIN_EMAIL;

  const today = new Date();
  const start = toDateOnly(today);
  const end = toDateOnly(addDays(today, daysAhead));

  const sources = [
    { entityType: "licenses", model: BranchLicenses, nameKey: "license_name", dateField: "expiry_date" },
    { entityType: "services", model: BranchServices, nameKey: "service_name", dateField: "expiry_date" },
    { entityType: "windows_servers", model: BranchWindowsServers, nameKey: "server_name", dateField: "expiry_date" },
    { entityType: "application_software", model: BranchApplicationSoftware, nameKey: "software_name", dateField: "expiry_date" },
    { entityType: "office_software", model: BranchOfficeSoftware, nameKey: "software_name", dateField: "expiry_date" },
    { entityType: "security_software", model: BranchSecuritySoftware, nameKey: "product_name", dateField: "expiry_date" },

    { entityType: "desktops", model: BranchDesktop, nameKey: "desktop_brand", dateField: "expiry_date" },
    { entityType: "laptops", model: BranchLaptop, nameKey: "laptop_brand", dateField: "expiry_date" },
    { entityType: "printers", model: BranchPrinter, nameKey: "printer_model", dateField: "expiry_date" },
    { entityType: "projectors", model: BranchProjector, nameKey: "projector_model", dateField: "expiry_date" },
    { entityType: "ups", model: BranchUps, nameKey: "ups_model", dateField: "expiry_date" },
    { entityType: "panels", model: BranchPanel, nameKey: "panel_name", dateField: "expiry_date" },
    { entityType: "ip_phones", model: BranchIpPhone, nameKey: "model", dateField: "expiry_date" },

    { entityType: "servers", model: BranchServer, nameKey: "ip_address", dateField: "expiry_date" },
    { entityType: "firewall_routers", model: BranchFirewallRouter, nameKey: "model", dateField: "license_expiry" },
  ];

  const newNotifications = [];

  for (const src of sources) {
    if (!src.model) continue;

    const dateField = src.dateField;

    const [expiringSoon, overdue] = await Promise.all([
      src.model.findAll({ where: { [dateField]: { [Op.between]: [start, end] } }, limit: 5000 }),
      src.model.findAll({ where: { [dateField]: { [Op.lt]: start } }, limit: 5000 }),
    ]);

    const rows = [
      ...expiringSoon.map((r) => ({ ...r.get(), __status: "EXPIRING" })),
      ...overdue.map((r) => ({ ...r.get(), __status: "OVERDUE" })),
    ];

    if (!rows.length) continue;

    const uniqKeys = rows
      .map((r) => {
        const expiry = r[dateField] ? toDateOnly(r[dateField]) : null;
        return expiry ? buildUniqKey(src.entityType, r.id, expiry, r.__status) : null;
      })
      .filter(Boolean);

    const existingNotifs = await Notification.findAll({ where: { uniqKey: uniqKeys } });
    const existingKeys = new Set(existingNotifs.map((n) => n.uniqKey));

    for (const r of rows) {
      const expiry = r[dateField] ? toDateOnly(r[dateField]) : null;
      if (!expiry) continue;

      const status = r.__status;
      const entityId = r.id;
      const uniq = buildUniqKey(src.entityType, entityId, expiry, status);
      if (existingKeys.has(uniq)) continue;

      const displayName =
        (r[src.nameKey] && String(r[src.nameKey]).trim()) || `${src.entityType}#${entityId}`;
      const branchId = r.branchId ?? null;

      const title = status === "OVERDUE" ? `Expired: ${displayName}` : `Expiry soon: ${displayName}`;
      const message =
        status === "OVERDUE"
          ? `${displayName} expired on ${expiry}.`
          : `${displayName} will expire on ${expiry} (within ${daysAhead} days).`;
      const notifType = status === "OVERDUE" ? "error" : "warning";

      try {
        const created = await Notification.create({
          type: notifType,
          title,
          message,
          entityType: src.entityType,
          entityId,
          expiryDate: expiry,
          dueDate: expiry,
          uniqKey: uniq,
          is_read: false,
          link: "/reports",
          meta: {
            branchId,
            displayName,
            daysAhead,
            status,
            sourceTable: src.model?.getTableName?.() || src.entityType,
            dateField,
          },
        });
        newNotifications.push(created);
      } catch (err) {
        console.error(`[ExpiryJob] Failed to create notification for ${displayName}:`, err.message || err);
      }
    }
  }

  if (adminEmail && newNotifications.length > 0) {
    const subject = "IT Asset Expiry & Overdue Notification Summary";

    const tableRows = newNotifications
      .slice(0, 50)
      .map(
        (n, i) => `
      <tr style="border-bottom:1px solid #ddd;">
        <td style="padding:8px;text-align:center;">${i + 1}</td>
        <td style="padding:8px;">${n.type.toUpperCase()}</td>
        <td style="padding:8px;">${n.title}</td>
        <td style="padding:8px;text-align:center;">${n.meta?.branchId || "-"}</td>
        <td style="padding:8px;text-align:center;">${n.dueDate || n.due_date}</td>
      </tr>`
      )
      .join("");

    const html = `
  <div style="font-family:Arial,sans-serif; font-size:14px; color:#333;">
    <p>Dear Admin,</p>
    <p>This is an automated notification from the <strong>Project Asset Management System (AMS)</strong>.</p>
    <p>The system has identified IT assets whose validity or warranty period is either:</p>
    <ul>
      <li>Approaching expiry within the next <strong>${daysAhead} days</strong></li>
      <li>Already expired and requiring immediate attention</li>
    </ul>
    <p><strong>Summary of newly generated alerts:</strong></p>
    <table style="border-collapse:collapse; width:100%; margin-top:10px;">
      <thead>
        <tr style="background-color:#f2f2f2;">
          <th style="padding:8px; border-bottom:1px solid #ddd;">#</th>
          <th style="padding:8px; border-bottom:1px solid #ddd;">Type</th>
          <th style="padding:8px; border-bottom:1px solid #ddd;">Title</th>
          <th style="padding:8px; border-bottom:1px solid #ddd;">Branch ID</th>
          <th style="padding:8px; border-bottom:1px solid #ddd;">Due Date</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
    <p style="margin-top:15px;">
      Please review the above items and take necessary actions to ensure uninterrupted operations and compliance.
    </p>
    <p style="margin-top:20px;">This is a system-generated message. Please do not reply.</p>
    <p>Regards,<br>
    <strong>IT & Digital Transformation Department</strong><br>
    Nepal Life Insurance Company Ltd.</p>
  </div>
  `;

    try {
      await sendMail({ to: adminEmail, subject, html });
      console.log(`[ExpiryJob] Email sent to ${adminEmail} for ${newNotifications.length} alerts.`);
    } catch (err) {
      console.error("[ExpiryJob] Email send failed:", err?.message || err);
    }
  } else {
    console.log(`[ExpiryJob] Done. New alerts: ${newNotifications.length}`);
    if (!adminEmail) console.log("[ExpiryJob] ADMIN_EMAIL not set. Email skipped.");
  }

  return { count: newNotifications.length };
}

function startExpiryJob() {
  const cronExpr = process.env.EXPIRY_CRON || "45 11 * * *";
  const daysAhead = Number(process.env.EXPIRY_DAYS_AHEAD || 7);

  cron.schedule(
    cronExpr,
    async () => {
      console.log("[ExpiryJob] Running expiry check...");
      await runExpiryCheck({ daysAhead });
    },
    { timezone: "Asia/Kathmandu" }
  );

  console.log(`[ExpiryJob] Scheduled: ${cronExpr} (Asia/Kathmandu), daysAhead=${daysAhead}`);
}

module.exports = { startExpiryJob, runExpiryCheck };