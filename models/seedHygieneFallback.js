const fs = require("fs");
const path = require("path");

const seedPath = path.join(__dirname, "..", "database", "seed_data.sql");
let fallbackGrades = null;

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

  return values.map((value) => {
    const cleaned = value.trim();
    if (/^NULL$/i.test(cleaned)) return null;
    if (/^GETDATE\(\)$/i.test(cleaned)) return new Date().toISOString();
    return cleaned;
  });
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
        record[column] = values[index] ?? null;
      });

      records.push(record);
    }
  }

  return records;
}

function getFallbackGrades() {
  if (fallbackGrades) return fallbackGrades;

  const grades = getInsertValues("hygiene_grades");
  fallbackGrades = grades.map((grade, index) => ({
    hygiene_id: index + 1,
    stall_id: Number(grade.stall_id),
    hygiene_grade: grade.hygiene_grade,
    score: grade.score === null ? null : Number(grade.score),
    inspection_date: grade.inspection_date,
    inspection_time: grade.inspection_time,
    inspection_by: grade.inspection_by,
    remarks: grade.remarks,
    updated_at: grade.updated_at || grade.created_at || null
  }));

  return fallbackGrades;
}

function getLatestGradesByStallId() {
  const grades = getFallbackGrades();
  const latestMap = new Map();

  grades.forEach((grade) => {
    const stallId = Number(grade.stall_id);
    const record = {
      hygiene_id: grade.hygiene_id,
      hygiene_grade: grade.hygiene_grade,
      score: grade.score === null ? null : Number(grade.score),
      inspection_date: grade.inspection_date,
      inspection_time: grade.inspection_time,
      inspection_by: grade.inspection_by,
      remarks: grade.remarks,
      updated_at: grade.updated_at || grade.created_at || null
    };
    const existing = latestMap.get(stallId);
    const existingKey = existing ? `${existing.inspection_date || ""} ${existing.inspection_time || ""}` : "";
    const recordKey = `${record.inspection_date || ""} ${record.inspection_time || ""}`;

    if (!existing || recordKey >= existingKey) {
      latestMap.set(stallId, record);
    }
  });

  return latestMap;
}

function getHistoryByStallId(stallId) {
  return getFallbackGrades()
    .filter((grade) => Number(grade.stall_id) === Number(stallId))
    .sort((a, b) => {
      const aKey = `${a.inspection_date || ""} ${a.inspection_time || ""}`;
      const bKey = `${b.inspection_date || ""} ${b.inspection_time || ""}`;
      return bKey.localeCompare(aKey);
    });
}

function getById(hygieneId) {
  return getFallbackGrades().find((grade) => Number(grade.hygiene_id) === Number(hygieneId)) || null;
}

function create(entry) {
  const grades = getFallbackGrades();
  const hygieneId = grades.reduce((max, grade) => Math.max(max, grade.hygiene_id), 0) + 1;

  grades.push({
    hygiene_id: hygieneId,
    stall_id: Number(entry.stallId),
    hygiene_grade: entry.hygieneGrade,
    score: entry.score === undefined || entry.score === "" ? null : Number(entry.score),
    inspection_date: entry.inspectionDate,
    inspection_time: entry.inspectionTime || null,
    inspection_by: entry.inspectionBy,
    remarks: entry.remarks || null,
    updated_at: new Date().toISOString()
  });

  return hygieneId;
}

function update(hygieneId, entry) {
  const grades = getFallbackGrades();
  const grade = grades.find((item) => Number(item.hygiene_id) === Number(hygieneId));

  if (!grade) return null;

  grade.hygiene_grade = entry.hygieneGrade;
  grade.score = entry.score === undefined || entry.score === "" ? null : Number(entry.score);
  grade.inspection_date = entry.inspectionDate;
  grade.inspection_time = entry.inspectionTime || null;
  grade.inspection_by = entry.inspectionBy;
  grade.remarks = entry.remarks || null;
  grade.updated_at = new Date().toISOString();

  return grade;
}

function deleteEntry(hygieneId) {
  const grades = getFallbackGrades();
  const index = grades.findIndex((grade) => Number(grade.hygiene_id) === Number(hygieneId));

  if (index === -1) return null;

  const [deleted] = grades.splice(index, 1);
  return deleted;
}

function getAllWithLatestGrade() {
  const stalls = getInsertValues("Stalls");
  const vendors = getInsertValues("Vendors");
  const menuItems = getInsertValues("MenuItem");
  const cuisines = getInsertValues("Cuisine");
  const latestMap = getLatestGradesByStallId();

  return stalls.map((stall, index) => {
    const stallId = index + 1;
    const vendorId = Number(stall.vendor_id);
    const cuisineId = Number(stall.cuisine_id);
    const vendor = vendors[vendorId - 1] || {};
    const cuisine = cuisines[cuisineId - 1] || {};
    const latest = latestMap.get(stallId) || {};
    const visibleMenuItems = menuItems.filter((item) => (
      Number(item.stall_id) === stallId && String(item.visibility) !== "0"
    )).length;

    return {
      stall_id: stallId,
      stall_name: stall.stall_name,
      location: stall.location,
      image_name: stall.image_name || null,
      rating: stall.rating === "" ? null : Number(stall.rating),
      cuisine_type: cuisine.cuisine_type || "",
      visible_menu_items: visibleMenuItems,
      vendor_id: vendorId,
      first_name: vendor.first_name,
      last_name: vendor.last_name,
      vendor_email: vendor.email,
      ...latest
    };
  });
}

module.exports = {
  getAllWithLatestGrade,
  getHistoryByStallId,
  getById,
  create,
  update,
  deleteEntry
};
