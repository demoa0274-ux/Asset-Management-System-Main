// backend/controllers/assetImportController.js
// Fully aligned with utils/excelHeaders.js — every case maps exactly to
// the column headers defined there. No phantom fields, no missing ones.
const asyncHandler = require("express-async-handler");
const { sendSuccess, sendError } = require("../utils/response");
const db = require("../models");

const {
  BranchConnectivity,
  BranchUps,
  BranchScanner,
  BranchProjector,
  BranchPrinter,
  BranchDesktop,
  BranchLaptop,
  BranchCctv,
  BranchPanel,
  BranchIpPhone,
  BranchServer,
  BranchFirewallRouter,
  BranchApplicationSoftware,
  BranchOfficeSoftware,
  BranchSecuritySoftware,
  BranchSecuritySoftwareInstalled,
  BranchUtilitySoftware,
  BranchServices,
  BranchLicenses,
  BranchWindowsOS,
  BranchWindowsServers,
  BranchSwitch,
  BranchExtraMonitor,
} = db;

// ─── helpers ──────────────────────────────────────────────────────────────────

const norm      = (v) => String(v ?? "").trim();
const normLower = (v) => norm(v).toLowerCase();

/** Convert Excel serial date number OR date string → JS Date | null */
function excelDateToJSDate(serial) {
  if (!serial) return null;
  if (typeof serial === "number") {
    const utc_days  = Math.floor(serial - 25569);
    const date_info = new Date(utc_days * 86400 * 1000);
    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
  }
  const d = new Date(serial);
  return isNaN(d) ? null : d;
}

const toStrOrNull = (v) => { const s = norm(v); return s || null; };

const toIntOrNull = (v) => {
  const s = norm(v);
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const toIntOrNullSafe = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/**
 * Read a value from an Excel row by trying multiple possible header names.
 * Returns the first match found, or undefined if none match.
 */
const getExcel = (row, keys = []) => {
  for (const k of keys) {
    if (row?.[k] !== undefined) return row[k];
  }
  return undefined;
};

/** Normalise a key to snake_case for attribute look-ups */
const toSnakeKey = (k) =>
  norm(k)
    .toLowerCase()
    .replace(/[\s\-]+/g, "_")
    .replace(/[^\w]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

/**
 * Back-fill any model attributes not already in payload by reading them
 * directly from the raw Excel row (handles unmapped / extra columns).
 */
const attachExtrasFromExcel = (Model, excelRow, payload) => {
  if (!Model?.rawAttributes || !excelRow) return payload;

  const deny    = new Set(["id","branchId","createdAt","updatedAt","created_at","updated_at"]);
  const allowed = Object.keys(Model.rawAttributes).filter((k) => !deny.has(k));
  const attrMap = new Map(allowed.map((a) => [toSnakeKey(a), a]));

  if (attrMap.has("assetid") && !attrMap.has("asset_id")) {
    attrMap.set("asset_id", attrMap.get("assetid"));
  }

  for (const [k, v] of Object.entries(excelRow)) {
    const attr = attrMap.get(toSnakeKey(k));
    if (!attr || payload[attr] !== undefined) continue;
    const typeKey = Model.rawAttributes[attr]?.type?.key || "";
    payload[attr] = typeKey === "INTEGER" ? toIntOrNull(v) : toStrOrNull(v);
  }

  return payload;
};

// ─── Per-section payload builder ──────────────────────────────────────────────
// Keys match EXACTLY the column names in EXCEL_HEADERS (utils/excelHeaders.js).

const buildPayloadFromExcelRow = (section, row) => {
  const common = {
    sub_category_code: toStrOrNull(getExcel(row, ["Sub-Cat Code", "sub_category_code"])),
    remarks:           toStrOrNull(getExcel(row, ["Remarks", "remarks"])),
  };

  switch (section) {

    // ── Desktop ──────────────────────────────────────────────────────────────
    case "desktop":
      return {
        ...common,
        assetId:              toStrOrNull(getExcel(row, ["Asset Code","asset_code","assetId"])),
        desktop_brand:        toStrOrNull(getExcel(row, ["Brand","brand"])),
        userName:             toStrOrNull(getExcel(row, ["Assigned User","assigned_user"])),
        desktop_ids:          toStrOrNull(getExcel(row, ["Desktop ID","desktop_id","desktop_ids"])),
        desktop_ram:          toStrOrNull(getExcel(row, ["RAM","ram"])),
        system_model:         toStrOrNull(getExcel(row, ["System Model","system_model"])),
        desktop_ssd:          toStrOrNull(getExcel(row, ["SSD","ssd"])),
        desktop_processor:    toStrOrNull(getExcel(row, ["Processor","processor"])),
        window_version:       toStrOrNull(getExcel(row, ["Windows Version","window_version"])),
        location:             toStrOrNull(getExcel(row, ["Location","location"])),
        ip_address:           toStrOrNull(getExcel(row, ["IP Address","ip_address"])),
        monitor_asset_code:   toStrOrNull(getExcel(row, ["Monitor code","monitor_code","monitor_asset_code"])),
        monitor_brand:        toStrOrNull(getExcel(row, ["Monitor Brand","monitor_brand"])),
        monitor_size:         toStrOrNull(getExcel(row, ["Monitor Size","monitor_size"])),
        monitor_location:     toStrOrNull(getExcel(row, ["Monitor Location","monitor_location"])),
        window_gen:           toStrOrNull(getExcel(row, ["Windows Gen","window_gen"])),
        monitor_purchase_year:toIntOrNullSafe(getExcel(row, ["Monitor Purchase Year","monitor_purchase_year"])),
        monitor_status:       toStrOrNull(getExcel(row, ["Monitor Status","monitor_status"])),
        status:               toStrOrNull(getExcel(row, ["Status","status"])),
      };

    // ── Laptop ───────────────────────────────────────────────────────────────
    case "laptop":
      return {
        ...common,
        assetId:          toStrOrNull(getExcel(row, ["Asset Code","asset_code","assetId"])),
        laptop_brand:     toStrOrNull(getExcel(row, ["Brand","brand"])),
        name:             toStrOrNull(getExcel(row, ["Name","name"])),
        laptop_user:      toStrOrNull(getExcel(row, ["Assigned User","assigned_user"])),
        laptop_ram:       toStrOrNull(getExcel(row, ["RAM","ram"])),
        laptop_ssd:       toStrOrNull(getExcel(row, ["SSD","ssd"])),
        laptop_processor: toStrOrNull(getExcel(row, ["Processor","processor"])),
        location:         toStrOrNull(getExcel(row, ["Location","location"])),
        ip_address:       toStrOrNull(getExcel(row, ["IP Address","ip_address"])),
        status:           toStrOrNull(getExcel(row, ["Status","status"])),
      };

    // ── Printer ──────────────────────────────────────────────────────────────
      case "printer":
        return {
          ...common,
          assetId:        toStrOrNull(getExcel(row, ["Asset Code","asset_code","assetId"])),
          assigned_user:  toStrOrNull(getExcel(row, ["Assigned User","assigned_user"])),
          printer_name:   toStrOrNull(getExcel(row, ["Name","name"])),
          name:           toStrOrNull(getExcel(row, ["Name","name"])),
          printer_model:  toStrOrNull(getExcel(row, ["Model","model"])),
          printer_type:   toStrOrNull(getExcel(row, ["Printer Type","printer_type","type"])),
          printer_status: toStrOrNull(getExcel(row, ["Status","status"])),
          location:       toStrOrNull(getExcel(row, ["Location","location"])),
          ip_address:     toStrOrNull(getExcel(row, ["IP Address","ip_address"])),
        };

    // ── Scanner ──────────────────────────────────────────────────────────────
    case "scanner":
      return {
        ...common,
        assetId:      toStrOrNull(getExcel(row, ["Asset Code","asset_code","assetId"])),
        scanner_name: toStrOrNull(getExcel(row, ["Name","name","scanner_name"])),
        scanner_model:toStrOrNull(getExcel(row, ["Model","model","scanner_model"])),
        location:     toStrOrNull(getExcel(row, ["Location","location"])),
      };

    // ── Projector ────────────────────────────────────────────────────────────
    case "projector":
      return {
        ...common,
        assetId:                toStrOrNull(getExcel(row, ["Asset Code","asset_code","assetId"])),
        projector_name:         toStrOrNull(getExcel(row, ["Name","name","projector_name"])),
        projector_model:        toStrOrNull(getExcel(row, ["Model","model","projector_model"])),
        projector_status:       toStrOrNull(getExcel(row, ["Status","status","projector_status"])),
        projector_purchase_date:excelDateToJSDate(getExcel(row, ["Purchase Date","purchase_date"])),
        location:               toStrOrNull(getExcel(row, ["Location","location"])),
        warranty_years:         toIntOrNullSafe(getExcel(row, ["Warranty Years","warranty_years"])),
      };

    // ── Panel ─────────────────────────────────────────────────────────────────
    case "panel":
      return {
        ...common,
        assetId:            toStrOrNull(getExcel(row, ["Asset Code","asset_code","assetId"])),
        panel_name:         toStrOrNull(getExcel(row, ["Name","name","panel_name"])),
        panel_brand:        toStrOrNull(getExcel(row, ["Brand","brand","panel_brand"])),
        panel_user:         toStrOrNull(getExcel(row, ["Assigned User","assigned_user","panel_user"])),
        panel_ip:           toStrOrNull(getExcel(row, ["IP Address","ip_address","panel_ip"])),
        panel_status:       toStrOrNull(getExcel(row, ["Status","status","panel_status"])),
        panel_purchase_year:toIntOrNullSafe(getExcel(row, ["Purchased Year","purchased_year","panel_purchase_year"])),
        location:           toStrOrNull(getExcel(row, ["Location","location"])),
        warranty_years:     toIntOrNullSafe(getExcel(row, ["Warranty Years","warranty_years"])),
      };

    // ── IP Phone ─────────────────────────────────────────────────────────────
    case "ipphone":
      return {
        ...common,
        assetId:             toStrOrNull(getExcel(row, ["Asset Code","asset_code","assetId"])),
        ip_telephone_ext_no: toStrOrNull(getExcel(row, ["Extension No","extension_no","ip_telephone_ext_no"])),
        ip_telephone_ip:     toStrOrNull(getExcel(row, ["IP Address","ip_address","ip_telephone_ip"])),
        ip_telephone_status: toStrOrNull(getExcel(row, ["Status","status","ip_telephone_status"])),
        assigned_user:       toStrOrNull(getExcel(row, ["Assigned User","assigned_user"])),
        model:               toStrOrNull(getExcel(row, ["Model","model"])),
        brand:               toStrOrNull(getExcel(row, ["Brand","brand"])),
        location:            toStrOrNull(getExcel(row, ["Location","location"])),
      };

    // ── CCTV ─────────────────────────────────────────────────────────────────
    case "cctv":
      return {
        ...common,
        assetId:         toStrOrNull(getExcel(row, ["Asset Code","asset_code","assetId"])),
        cctv_brand:      toStrOrNull(getExcel(row, ["Brand","brand","cctv_brand"])),
        cctv_nvr_ip:     toStrOrNull(getExcel(row, ["NVR IP","nvr_ip","cctv_nvr_ip"])),
        cctv_record_days:toIntOrNullSafe(getExcel(row, ["Record Days","record_days","cctv_record_days"])),
        capacity:        toStrOrNull(getExcel(row, ["Capacity","capacity"])),
        channel:         toIntOrNullSafe(getExcel(row, ["Channel","channel"])),
        vendor:          toStrOrNull(getExcel(row, ["Vendor","vendor"])),
        purchase_date:   excelDateToJSDate(getExcel(row, ["Purchase Date","purchase_date"])),
      };

    // ── Connectivity (single) ─────────────────────────────────────────────────
    case "connectivity":
      return {
        ...common,
        connectivity_status:  toStrOrNull(getExcel(row, ["Status","status","connectivity_status"])),
        connectivity_network: toStrOrNull(getExcel(row, ["Network","network","connectivity_network"])),
        connectivity_lan_ip:  toStrOrNull(getExcel(row, ["LAN IP","lan_ip","connectivity_lan_ip"])),
        connectivity_wlink:   toStrOrNull(getExcel(row, ["WAN Link","wan_link","connectivity_wlink"])),
        installed_year:       toIntOrNullSafe(getExcel(row, ["Installed Year","installed_year"])),
        location:             toStrOrNull(getExcel(row, ["Location","location"])),
      };

    // ── UPS (single) ─────────────────────────────────────────────────────────
    case "ups":
      return {
        ...common,
        ups_model:        toStrOrNull(getExcel(row, ["Model","model","ups_model"])),
        ups_backup_time:  toStrOrNull(getExcel(row, ["Backup Time","backup_time","ups_backup_time"])),
        ups_installer:    toStrOrNull(getExcel(row, ["Installer","installer","ups_installer"])),
        ups_rating:       toStrOrNull(getExcel(row, ["Rating","rating","ups_rating"])),
        battery_rating:   toStrOrNull(getExcel(row, ["Battery Rating","battery_rating"])),
        ups_purchase_year:toIntOrNullSafe(getExcel(row, ["Purchased Year","purchased_year","ups_purchase_year"])),
        ups_status:       toStrOrNull(getExcel(row, ["Status","status","ups_status"])),
      };

    // ── Server ───────────────────────────────────────────────────────────────
    case "server":
      return {
        ...common,
        brand:                  toStrOrNull(getExcel(row, ["Brand","brand"])),
        ip_address:             toStrOrNull(getExcel(row, ["IP Address","ip_address"])),
        location:               toStrOrNull(getExcel(row, ["Location","location"])),
        model_no:               toStrOrNull(getExcel(row, ["Model No","model_no","model"])),
        purchase_date:          excelDateToJSDate(getExcel(row, ["Purchase Date","purchase_date"])),
        vendor:                 toStrOrNull(getExcel(row, ["Vendor","vendor"])),
        specification:          toStrOrNull(getExcel(row, ["Specification","specification"])),
        storage:                toStrOrNull(getExcel(row, ["Storage","storage"])),
        memory:                 toStrOrNull(getExcel(row, ["Memory","memory"])),
        windows_server_version: toStrOrNull(getExcel(row, ["Window Server Version","windows_server_version"])),
        virtualization:         toStrOrNull(getExcel(row, ["Virtualization","virtualization"])),
        how_many_server:        toIntOrNull(getExcel(row, ["How Many Server","how_many_server"])),
      };

    // ── Firewall / Router ─────────────────────────────────────────────────────
    case "firewall_router":
    case "firewall-routers":
    case "firewallrouters":
      return {
        ...common,
        brand:                 toStrOrNull(getExcel(row, ["Brand","brand"])),
        model:                 toStrOrNull(getExcel(row, ["Model","model"])),
        purchase_date:         excelDateToJSDate(getExcel(row, ["Purchase Date","purchase_date"])),
        vendor:                toStrOrNull(getExcel(row, ["Vendor","vendor"])),
        license_expiry:        excelDateToJSDate(getExcel(row, ["Liscence-expiry","License Expiry","license_expiry"])),
        specification_remarks: toStrOrNull(getExcel(row, ["Specification/Remarks","specification_remarks","Specification"])),
      };

    // ── Switch ────────────────────────────────────────────────────────────────
    case "switch":
      return {
        ...common,
        assetId:       toStrOrNull(getExcel(row, ["Asset Code","asset_code","assetId"])),
        asset_name:    toStrOrNull(getExcel(row, ["Asset Name","asset_name","Name","name"])),
        model:         toStrOrNull(getExcel(row, ["Model","model"])),
        type:          toStrOrNull(getExcel(row, ["Type","type"])),
        brand:         toStrOrNull(getExcel(row, ["Brand","brand"])),
        location:      toStrOrNull(getExcel(row, ["Location","location"])),
        port:          toStrOrNull(getExcel(row, ["Port","port"])),
        assigned_user: toStrOrNull(getExcel(row, ["Assigned User","assigned_user"])),
      };

    // ── Extra Monitor ─────────────────────────────────────────────────────────
    case "extra_monitor":
    case "extramonitor":
    case "extra-monitor":
    case "extra_monitors":
      return {
        ...common,
        assetId:              toStrOrNull(getExcel(row, ["Asset Code","asset_code","assetId"])),
        monitor_name:         toStrOrNull(getExcel(row, ["Monitor Name","monitor_name"])),
        monitor_brand:        toStrOrNull(getExcel(row, ["Monitor Brand","monitor_brand"])),
        monitor_size:         toStrOrNull(getExcel(row, ["Monitor Size","monitor_size"])),
        monitor_location:     toStrOrNull(getExcel(row, ["Monitor Location","monitor_location"])),
        // monitor_purchase_year:toIntOrNullSafe(getExcel(row, ["Monitor Purchase Year","monitor_purchase_year"])),
        monitor_status:       toStrOrNull(getExcel(row, ["Monitor Status","monitor_status"])),
        system_model:         toStrOrNull(getExcel(row, ["System Model","system_model"])),
        assigned_user:        toStrOrNull(getExcel(row, ["Assigned User","assigned_user"])),
      };

    // ── Application Software ──────────────────────────────────────────────────
    case "application_software":
      return {
        ...common,
        assetId:          toStrOrNull(getExcel(row, ["Asset Code","asset_code","assetId"])),
        software_name:    toStrOrNull(getExcel(row, ["Name","name","software_name"])),
        software_category:toStrOrNull(getExcel(row, ["Category","category","software_category"])),
        version:          toStrOrNull(getExcel(row, ["Version","version"])),
        vendor_name:      toStrOrNull(getExcel(row, ["Vendor","vendor","vendor_name"])),
        license_type:     toStrOrNull(getExcel(row, ["License Type","license_type"])),
        license_key:      toStrOrNull(getExcel(row, ["License Key","license_key"])),
        quantity:         toIntOrNull(getExcel(row, ["Quantity","quantity"])),
        purchase_date:    excelDateToJSDate(getExcel(row, ["Purchase Date","purchase_date"])),
        expiry_date:      excelDateToJSDate(getExcel(row, ["Expiry Date","expiry_date"])),
        assigned_to:      toStrOrNull(getExcel(row, ["Assigned To","assigned_to"])),
      };

    // ── Office Software ───────────────────────────────────────────────────────
    case "office_software":
      return {
        ...common,
        assetId:          toStrOrNull(getExcel(row, ["Asset Code","asset_code","assetId"])),
        software_name:    toStrOrNull(getExcel(row, ["Name","name","software_name"])),
        software_category:toStrOrNull(getExcel(row, ["Category","category","software_category"])),
        version:          toStrOrNull(getExcel(row, ["Version","version"])),
        vendor_name:      toStrOrNull(getExcel(row, ["Vendor","vendor","vendor_name"])),
        installed_on:     toStrOrNull(getExcel(row, ["Installed On","installed_on"])),
        pc_name:          toStrOrNull(getExcel(row, ["PC Name","pc_name"])),
        installed_by:     toStrOrNull(getExcel(row, ["Installed By","installed_by"])),
        install_date:     excelDateToJSDate(getExcel(row, ["Install Date","install_date"])),
        license_type:     toStrOrNull(getExcel(row, ["License Type","license_type"])),
        license_key:      toStrOrNull(getExcel(row, ["License Key","license_key"])),
        quantity:         toIntOrNull(getExcel(row, ["Quantity","quantity"])),
        purchase_date:    excelDateToJSDate(getExcel(row, ["Purchase Date","purchase_date"])),
        expiry_date:      excelDateToJSDate(getExcel(row, ["Expiry Date","expiry_date"])),
        assigned_to:      toStrOrNull(getExcel(row, ["Assigned To","assigned_to"])),
      };

    // ── Utility Software ──────────────────────────────────────────────────────
    case "utility_software":
      return {
        ...common,
        assetId:      toStrOrNull(getExcel(row, ["Asset Code","asset_code","assetId"])),
        software_name:toStrOrNull(getExcel(row, ["Name","name","software_name"])),
        version:      toStrOrNull(getExcel(row, ["Version","version"])),
        category:     toStrOrNull(getExcel(row, ["Category","category"])),
        pc_name:      toStrOrNull(getExcel(row, ["PC Name","pc_name"])),
        installed_by: toStrOrNull(getExcel(row, ["Installed By","installed_by"])),
        install_date: excelDateToJSDate(getExcel(row, ["Install Date","install_date"])),
      };

    // ── Security Software ─────────────────────────────────────────────────────
    case "security_software":
      return {
        ...common,
        assetId:      toStrOrNull(getExcel(row, ["Asset Code","asset_code","assetId"])),
        product_name: toStrOrNull(getExcel(row, ["Name","name","product_name"])),
        vendor_name:  toStrOrNull(getExcel(row, ["Vendor","vendor","vendor_name"])),
        license_type: toStrOrNull(getExcel(row, ["License Type","license_type"])),
        total_nodes:  toIntOrNull(getExcel(row, ["Total Nodes","total_nodes"])),
        expiry_date:  excelDateToJSDate(getExcel(row, ["Expiry Date","expiry_date"])),
      };

    // ── Security Software Installed ───────────────────────────────────────────
    case "security_software_installed":
      return {
        ...common,
        assetId:             toStrOrNull(getExcel(row, ["Asset Code","asset_code","assetId"])),
        product_name:        toStrOrNull(getExcel(row, ["Name","name","product_name"])),
        version:             toStrOrNull(getExcel(row, ["Version","version"])),
        pc_name:             toStrOrNull(getExcel(row, ["PC Name","pc_name"])),
        real_time_protection:toStrOrNull(getExcel(row, ["Real Time Protection","real_time_protection"])),
        last_update_date:    excelDateToJSDate(getExcel(row, ["Last Update Date","last_update_date"])),
        installed_by:        toStrOrNull(getExcel(row, ["Installed By","installed_by"])),
      };

    // ── Services ──────────────────────────────────────────────────────────────
    case "services":
      return {
        ...common,
        assetId:          toStrOrNull(getExcel(row, ["Asset Code","asset_code","assetId"])),
        service_name:     toStrOrNull(getExcel(row, ["Name","name","service_name"])),
        service_category: toStrOrNull(getExcel(row, ["Category","category","service_category"])),
        provider_name:    toStrOrNull(getExcel(row, ["Provider","provider","provider_name"])),
        contract_no:      toStrOrNull(getExcel(row, ["Contract No","contract_no"])),
        provider_contact: toStrOrNull(getExcel(row, ["Provider Contact","provider_contact"])),
        start_date:       excelDateToJSDate(getExcel(row, ["Start Date","start_date"])),
        expiry_date:      excelDateToJSDate(getExcel(row, ["Expiry Date","expiry_date"])),
      };

    // ── Licenses ──────────────────────────────────────────────────────────────
    case "licenses":
      return {
        ...common,
        assetId:      toStrOrNull(getExcel(row, ["Asset Code","asset_code","assetId"])),
        license_name: toStrOrNull(getExcel(row, ["Name","name","license_name"])),
        license_type: toStrOrNull(getExcel(row, ["License Type","license_type"])),
        license_key:  toStrOrNull(getExcel(row, ["License Key","license_key"])),
        quantity:     toIntOrNull(getExcel(row, ["Quantity","quantity"])),
        vendor_name:  toStrOrNull(getExcel(row, ["Vendor","vendor","vendor_name"])),
        purchase_date:excelDateToJSDate(getExcel(row, ["Purchase Date","purchase_date"])),
        expiry_date:  excelDateToJSDate(getExcel(row, ["Expiry Date","expiry_date"])),
        assigned_to:  toStrOrNull(getExcel(row, ["Assigned To","assigned_to"])),
      };

    // ── Windows OS ────────────────────────────────────────────────────────────
    case "windows_os":
      return {
        ...common,
        assetId:           toStrOrNull(getExcel(row, ["Asset Code","asset_code","assetId"])),
        device_type:       toStrOrNull(getExcel(row, ["Device Type","device_type"])),
        device_asset_id:   toStrOrNull(getExcel(row, ["Device Asset Code","device_asset_code","device_asset_id"])),
        os_version:        toStrOrNull(getExcel(row, ["OS Version","os_version"])),
        license_type:      toStrOrNull(getExcel(row, ["License Type","license_type"])),
        license_key:       toStrOrNull(getExcel(row, ["License Key","license_key"])),
        activation_status: toStrOrNull(getExcel(row, ["Activation Status","activation_status"])),
        installed_date:    excelDateToJSDate(getExcel(row, ["Installed Date","installed_date"])),
      };

    // ── Windows Servers ───────────────────────────────────────────────────────
    case "windows_servers":
      return {
        ...common,
        assetId:        toStrOrNull(getExcel(row, ["Asset Code","asset_code","assetId"])),
        server_name:    toStrOrNull(getExcel(row, ["Server Name","server_name"])),
        server_role:    toStrOrNull(getExcel(row, ["Server Role","server_role"])),
        os_version:     toStrOrNull(getExcel(row, ["OS Version","os_version"])),
        license_type:   toStrOrNull(getExcel(row, ["License Type","license_type"])),
        license_key:    toStrOrNull(getExcel(row, ["License Key","license_key"])),
        cores_licensed: toIntOrNull(getExcel(row, ["Cores Licensed","cores_licensed"])),
        expiry_date:    excelDateToJSDate(getExcel(row, ["Expiry Date","expiry_date"])),
      };

    default:
      return common;
  }
};

// ─── Section → model map ──────────────────────────────────────────────────────

const sectionMap = {
  desktop:                   { type: "multi",  model: BranchDesktop },
  laptop:                    { type: "multi",  model: BranchLaptop },
  printer:                   { type: "multi",  model: BranchPrinter },
  scanner:                   { type: "multi",  model: BranchScanner },
  projector:                 { type: "multi",  model: BranchProjector },
  panel:                     { type: "multi",  model: BranchPanel },
  ipphone:                   { type: "multi",  model: BranchIpPhone },
  cctv:                      { type: "multi",  model: BranchCctv },
  server:                    { type: "multi",  model: BranchServer },
  firewall_router:           { type: "multi",  model: BranchFirewallRouter },
  "firewall-routers":        { type: "multi",  model: BranchFirewallRouter },
  firewallrouters:           { type: "multi",  model: BranchFirewallRouter },
  switch:                    { type: "multi",  model: BranchSwitch },
  extra_monitor:             { type: "multi",  model: BranchExtraMonitor },
  extramonitor:              { type: "multi",  model: BranchExtraMonitor },
  "extra-monitor":           { type: "multi",  model: BranchExtraMonitor },
  extra_monitors:            { type: "multi",  model: BranchExtraMonitor },
  connectivity:              { type: "single", model: BranchConnectivity },
  ups:                       { type: "single", model: BranchUps },
  application_software:      { type: "multi",  model: BranchApplicationSoftware },
  office_software:           { type: "multi",  model: BranchOfficeSoftware },
  utility_software:          { type: "multi",  model: BranchUtilitySoftware },
  security_software:         { type: "multi",  model: BranchSecuritySoftware },
  security_software_installed:{ type: "multi", model: BranchSecuritySoftwareInstalled },
  services:                  { type: "multi",  model: BranchServices },
  licenses:                  { type: "multi",  model: BranchLicenses },
  windows_os:                { type: "multi",  model: BranchWindowsOS },
  windows_servers:           { type: "multi",  model: BranchWindowsServers },
};

const updateOrCreateSingle = async (Model, branchId, payload, t) => {
  let rec = await Model.findOne({ where: { branchId }, transaction: t });
  if (!rec) rec = await Model.create({ branchId }, { transaction: t });
  await rec.update(payload, { transaction: t });
  return rec;
};

// ─── Main handler ─────────────────────────────────────────────────────────────

exports.importAssets = asyncHandler(async (req, res) => {
  const rows = req.body?.rows;
  if (!Array.isArray(rows) || rows.length === 0) {
    return sendError(res, "rows[] is required", 400);
  }

  const result = { inserted: 0, updated: 0, failed: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const item  = rows[i];
    const rowNo = item?.rowNo ?? i + 1;

    const section  = normLower(item?.section);
    const branchId = toIntOrNull(item?.branchId);
    const excelRow = item?.excelRow || item?.data || item;

    if (!section || !branchId) {
      result.failed++;
      result.errors.push({ rowNo, message: "Missing section or branchId" });
      continue;
    }

    const cfg = sectionMap[section];
    if (!cfg) {
      result.failed++;
      result.errors.push({ rowNo, message: `Invalid section: "${section}"` });
      continue;
    }

    const identifierRaw =
      getExcel(excelRow, ["Asset Code","Asset ID","assetId","asset_id","AssetID"]) ||
      getExcel(excelRow, ["Desktop ID","desktop_id","desktop_ids"]) ||
      item?.assetId ||
      item?.id;

    const numericId    = toIntOrNull(identifierRaw);
    const stringAssetId = toStrOrNull(identifierRaw);

    let payload =
      item?.payload && typeof item.payload === "object"
        ? item.payload
        : buildPayloadFromExcelRow(section, excelRow);

    payload = attachExtrasFromExcel(cfg.model, excelRow, payload);

    const t = await db.sequelize.transaction();

    try {
      if (cfg.type === "single") {
        await updateOrCreateSingle(cfg.model, branchId, payload, t);
        result.updated++;
        await t.commit();
        continue;
      }

      let whereCondition = {};
      let rec = null;

      if (section === "cctv") {
        const branch = await db.Branch.findByPk(branchId, { transaction: t });
        if (!branch) throw new Error("Branch not found");
        payload.branch_code = branch.branch_code;

        if (numericId)      whereCondition = { cctv_id: numericId, branch_code: branch.branch_code };
        else if (stringAssetId) whereCondition = { assetId: stringAssetId, branch_code: branch.branch_code };
      } else {
        payload.branchId = branchId;

        if (numericId)      whereCondition = { id: numericId, branchId };
        else if (stringAssetId) whereCondition = { assetId: stringAssetId, branchId };
      }

      if (Object.keys(whereCondition).length) {
        rec = await cfg.model.findOne({ where: whereCondition, transaction: t });
      }

      if (rec) {
        await rec.update(payload, { transaction: t });
        result.updated++;
      } else {
        if (stringAssetId) payload.assetId = stringAssetId;
        await cfg.model.create(payload, { transaction: t });
        result.inserted++;
      }

      await t.commit();
    } catch (rowErr) {
      await t.rollback();
      result.failed++;
      console.error(`❌ Row ${rowNo} failed:`, rowErr?.message || rowErr);

      const entry = { rowNo, message: rowErr?.message || "Row import failed" };
      if (
        rowErr?.name === "SequelizeValidationError" ||
        rowErr?.name === "SequelizeUniqueConstraintError"
      ) {
        entry.errors = (rowErr.errors || []).map((e) => ({
          message: e.message,
          path:    e.path,
          value:   e.value,
        }));
      }
      result.errors.push(entry);
    }
  }

  return sendSuccess(res, result, "Import finished");
});