const fs = require("fs");
const path = require("path");

const seedPath = path.join(__dirname, "..", "database", "seed_data.sql");

function readSeed() {
  if (!fs.existsSync(seedPath)) return "";
  return fs.readFileSync(seedPath, "utf8");
}

function splitSqlValues(valuesText) {
  const values = [];
  let current = "";
  let inQuote = false;
  let depth = 0;

  for (let i = 0; i < valuesText.length; i += 1) {
    const char = valuesText[i];
    const next = valuesText[i + 1];

    if (char === "'" && next === "'") {
      current += "'";
      i += 1;
      continue;
    }

    if (char === "'") {
      inQuote = !inQuote;
      continue;
    }

    if (!inQuote && char === "(") {
      depth += 1;
      current += char;
      continue;
    }

    if (!inQuote && char === ")") {
      depth -= 1;
      current += char;
      continue;
    }

    if (char === "," && !inQuote && depth === 0) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) values.push(current.trim());

  return values.map((value) => value.replace(/^NULL$/i, ""));
}

function getInsertValues(tableName) {
  const sql = readSeed();
  const regex = new RegExp(`INSERT\\s+INTO\\s+${tableName}\\s*\\(([^)]*)\\)\\s*VALUES\\s*([\\s\\S]*?);`, "gi");
  const records = [];
  let match;

  while ((match = regex.exec(sql)) !== null) {
    const columns = match[1].split(",").map((column) => column.trim());
    const valuesBlock = match[2];
    const rowRegex = /\(([\s\S]*?)\)(?=\s*,|\s*$)/g;
    let rowMatch;

    while ((rowMatch = rowRegex.exec(valuesBlock)) !== null) {
      const values = splitSqlValues(rowMatch[1]);
      const record = {};

      columns.forEach((column, index) => {
        record[column] = values[index] || "";
      });

      records.push(record);
    }
  }

  return records;
}

function getVendorMap() {
  const vendors = getInsertValues("Vendors");
  const map = new Map();

  vendors.forEach((vendor, index) => {
    const vendorId = index + 1;
    map.set(vendorId, {
      vendorId,
      vendorName: [vendor.first_name, vendor.last_name].filter(Boolean).join(" ") || vendor.username || `Vendor ${vendorId}`,
      vendorEmail: vendor.email || "No email found"
    });
  });

  return map;
}

function getStallByVendorId() {
  const stalls = getInsertValues("Stalls");
  const map = new Map();

  stalls.forEach((stall) => {
    const vendorId = Number(stall.vendor_id);

    if (!map.has(vendorId)) {
      map.set(vendorId, {
        stallName: stall.stall_name || "No stall assigned",
        stallLocation: stall.location || "No location added"
      });
    }
  });

  return map;
}

function loadCertificates() {
  const vendorMap = getVendorMap();
  const stallMap = getStallByVendorId();
  const certificates = getInsertValues("FoodHandlerCertificate");

  return certificates.map((certificate, index) => {
    const certificateId = index + 1;
    const vendorId = Number(certificate.vendor_id);
    const vendor = vendorMap.get(vendorId) || {};
    const stall = stallMap.get(vendorId) || {};

    return {
      certificateId,
      vendorId,
      certificateName: certificate.certificate_name,
      issueDate: certificate.issue_date,
      expiryDate: certificate.expiry_date,
      issuingAuthority: certificate.issuing_authority,
      approvalStatus: certificate.approval_status,
      vendorName: vendor.vendorName || `Vendor ${vendorId}`,
      vendorEmail: vendor.vendorEmail || "No email found",
      stallName: stall.stallName || "No stall assigned",
      stallLocation: stall.stallLocation || "No location added"
    };
  });
}

let cachedCertificates;

function getCertificates() {
  if (!cachedCertificates) cachedCertificates = loadCertificates();
  return cachedCertificates;
}

function getVendorCertificates(vendorId) {
  return getCertificates()
    .filter((certificate) => certificate.vendorId === Number(vendorId))
    .map((certificate) => ({
      certificate_id: certificate.certificateId,
      certificate_name: certificate.certificateName,
      issue_date: certificate.issueDate,
      expiry_date: certificate.expiryDate,
      validity_period: Math.ceil(
        (new Date(certificate.expiryDate) - new Date(certificate.issueDate)) /
        (1000 * 60 * 60 * 24)
      ),
      issuing_authority: certificate.issuingAuthority,
      approval_status: certificate.approvalStatus,
      certificate_image_path: certificate.certificateUrl || null
    }));
}

function createVendorCertificate(certificate) {
  const certificates = getCertificates();
  const certificateId = certificates.reduce(
    (largestId, record) => Math.max(largestId, Number(record.certificateId) || 0),
    0
  ) + 1;

  const record = {
    certificateId,
    vendorId: Number(certificate.vendor_id),
    certificateName: certificate.certificate_name,
    issueDate: certificate.issue_date,
    expiryDate: certificate.expiry_date,
    issuingAuthority: certificate.issuing_authority,
    approvalStatus: "Pending",
    certificateUrl: certificate.certificate_image_path || null,
    vendorName: `Vendor ${certificate.vendor_id}`,
    vendorEmail: "Vendor account",
    stallName: "Vendor stall",
    stallLocation: "No location added"
  };

  certificates.push(record);
  return {
    certificate_id: certificateId,
    certificate_image_path: record.certificateUrl
  };
}

module.exports = {
  getCertificates,
  getVendorCertificates,
  createVendorCertificate
};
