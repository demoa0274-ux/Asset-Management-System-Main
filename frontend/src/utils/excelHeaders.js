// utils/excelHeaders.js

const EXCEL_HEADERS = {
  desktop: [
    "Section","Branch","Asset Code","Sub-Cat Code","Brand","Assigned User","Desktop ID",
    "RAM","System Model","SSD","Processor","Windows Version","Monitor code","Location",
    "IP Address","Monitor Brand","Monitor Size","Monitor Location","Windows Gen",
    "Monitor Purchase Year","Monitor Status","Status","Remarks",
  ],

  laptop: [
    "Section","Branch","Asset Code","Sub-Cat Code","Brand","Name","Assigned User",
    "RAM","SSD","Processor","Location","IP Address","Status","Remarks",
  ],

  printer: [
    "Section","Branch","Asset Code","Sub-Cat Code","Assigned User","Name","Model",
    "Printer Type","Status","Location","IP Address","Remarks",
  ],

  scanner: [
    "Section","Branch","Asset Code","Sub-Cat Code","Name","Model","Location","Remarks",
  ],

  projector: [
    "Section","Branch","Asset Code","Sub-Cat Code","Name","Model","Status",
    "Purchase Date","Location","Warranty Years","Remarks",
  ],

  panel: [
    "Section","Branch","Asset Code","Sub-Cat Code","Name","Brand","Assigned User",
    "IP Address","Status","Purchased Year","Location","Warranty Years","Remarks",
  ],

  ipphone: [
    "Section","Branch","Asset Code","Sub-Cat Code","Extension No","IP Address","Status",
    "Assigned User","Model","Brand","Location","Remarks",
  ],

  cctv: [
    "Section","Branch","Asset Code","Sub-Cat Code","Brand","NVR IP","Record Days",
    "Capacity","Channel","Vendor","Purchase Date","Remarks",
  ],

  connectivity: [
    "Section","Branch","Sub-Cat Code","Status","Network","LAN IP","WAN Link",
    "Installed Year","Location","Remarks",
  ],

  ups: [
    "Section","Branch","Sub-Cat Code","Model","Backup Time","Installer","Rating",
    "Battery Rating","Purchased Year","Status","Remarks",
  ],

  server: [
    "Section","Branch","Sub-Cat Code","Brand","IP Address","Location","Model No",
    "Purchase Date","Vendor","Specification","Storage","Memory",
    "Window Server Version","Virtualization","How Many Server","Remarks",
  ],

  firewall_router: [
    "Section","Branch","Sub-Cat Code","Brand","Model","Purchase Date","Vendor",
    "Liscence-expiry","Specification/Remarks","Remarks",
  ],

  switch: [
    "Section","Branch","Asset Code","Sub-Cat Code",
    "Asset Name","Model","Type","Brand","Location","Port","Assigned User","Remarks",
  ],

  extra_monitor: [
    "Section","Branch","Asset Code","Sub-Cat Code","Monitor Brand","Monitor Size","Monitor Location","Monitor Status","System Model","Assigned User","Remarks",
  ],

  application_software: [
    "Section","Branch","Asset Code","Sub-Cat Code","Name","Category","Version","Vendor",
    "License Type","License Key","Quantity","Purchase Date","Expiry Date","Assigned To","Remarks",
  ],

  office_software: [
    "Section","Branch","Asset Code","Sub-Cat Code","Name","Category","Version","Vendor",
    "Installed On","PC Name","Installed By","Install Date","License Type","License Key",
    "Quantity","Purchase Date","Expiry Date","Assigned To","Remarks",
  ],

  utility_software: [
    "Section","Branch","Asset Code","Sub-Cat Code","Name","Version","Category",
    "PC Name","Installed By","Install Date","Remarks",
  ],

  security_software: [
    "Section","Branch","Asset Code","Sub-Cat Code","Name","Vendor","License Type",
    "Total Nodes","Expiry Date","Remarks",
  ],

  security_software_installed: [
    "Section","Branch","Asset Code","Sub-Cat Code","Name","Version","PC Name",
    "Real Time Protection","Last Update Date","Installed By","Remarks",
  ],

  services: [
    "Section","Branch","Asset Code","Sub-Cat Code","Name","Category","Provider",
    "Contract No","Provider Contact","Start Date","Expiry Date","Remarks",
  ],

  licenses: [
    "Section","Branch","Asset Code","Sub-Cat Code","Name","License Type","License Key",
    "Quantity","Vendor","Purchase Date","Expiry Date","Assigned To","Remarks",
  ],

  windows_os: [
    "Section","Branch","Asset Code","Sub-Cat Code","Device Type","Device Asset Code",
    "OS Version","License Type","License Key","Activation Status","Installed Date","Remarks",
  ],

  windows_servers: [
    "Section","Branch","Asset Code","Sub-Cat Code","Server Name","Server Role","OS Version",
    "License Type","License Key","Cores Licensed","Expiry Date","Remarks",
  ],
};

export default EXCEL_HEADERS;