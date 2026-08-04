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

    if (char === "," && !inQuote) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) values.push(current.trim());
  return values.map((value) => value.replace(/^NULL$/i, ""));
}

function getInsertRows(tableName) {
  const sql = readSeed();
  const regex = new RegExp(`INSERT\\s+INTO\\s+${tableName}\\s*\\(([^)]*)\\)\\s*VALUES\\s*([\\s\\S]*?);`, "gi");
  const rows = [];
  let match;

  while ((match = regex.exec(sql)) !== null) {
    const columns = match[1].split(",").map((column) => column.trim());
    const valuesBlock = match[2];
    const rowRegex = /\(([\s\S]*?)\)(?=\s*,|\s*$)/g;
    let rowMatch;

    while ((rowMatch = rowRegex.exec(valuesBlock)) !== null) {
      const values = splitSqlValues(rowMatch[1]);
      const row = {};

      columns.forEach((column, index) => {
        row[column] = values[index] || "";
      });

      rows.push(row);
    }
  }

  return rows;
}

function getTableForRole(role) {
  if (role === "patron") return "Patrons";
  if (role === "vendor") return "Vendors";
  if (role === "officer") return "NEAOfficers";
  return null;
}

function getIdColumnForRole(role) {
  if (role === "patron") return "patron_id";
  if (role === "vendor") return "vendor_id";
  if (role === "officer") return "officer_id";
  return "id";
}

function findByUsername(role, username) {
  const tableName = getTableForRole(role);
  if (!tableName) return null;

  const rows = getInsertRows(tableName);
  const rowIndex = rows.findIndex((row) => row.username === username);
  if (rowIndex === -1) return null;

  const idColumn = getIdColumnForRole(role);
  const row = rows[rowIndex];

  return {
    id: Number(row[idColumn]) || rowIndex + 1,
    username: row.username,
    password: row.password
  };
}

function findById(role, id) {
  const tableName = getTableForRole(role);
  if (!tableName) return null;
  const idColumn = getIdColumnForRole(role);
  const rows = getInsertRows(tableName);
  const row = rows.find((item, index) => Number(item[idColumn] || index + 1) === Number(id));
  return row ? { ...row, id: Number(row[idColumn]) || Number(id) } : null;
}

function getRows(tableName) {
  return getInsertRows(tableName).map((row) => ({ ...row }));
}

module.exports = {
  findByUsername,
  findById,
  getRows
};
