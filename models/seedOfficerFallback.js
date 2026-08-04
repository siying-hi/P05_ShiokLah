const fs = require("fs");
const path = require("path");

const seedPath = path.join(__dirname, "..", "database", "seed_data.sql");

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

function getSeedOfficer() {
  if (!fs.existsSync(seedPath)) return null;

  const sql = fs.readFileSync(seedPath, "utf8");
  const match = sql.match(/INSERT\s+INTO\s+NEAOfficers[\s\S]*?VALUES\s*\(([\s\S]*?)\);/i);

  if (!match) return null;

  const values = splitSqlValues(match[1]);

  return {
    officer_id: 1,
    username: values[0],
    full_name: values[1],
    email: values[2],
    password: values[3],
    phone: values[4],
    role: "NEA Officer",
    assigned_area: values[5],
    profile_image: values[6]
  };
}

function findOfficerByUsername(username) {
  const officer = getSeedOfficer();

  if (!officer || String(officer.username).toLowerCase() !== String(username).toLowerCase()) return null;

  return {
    id: officer.officer_id,
    username: officer.username,
    password: officer.password
  };
}

function findOfficerByEmail(email) {
  const officer = getSeedOfficer();

  if (!officer || String(officer.email).toLowerCase() !== String(email).toLowerCase()) return null;

  return {
    id: officer.officer_id,
    email: officer.email,
    password: officer.password
  };
}

function findOfficerByLogin(login) {
  return findOfficerByEmail(login) || findOfficerByUsername(login);
}

function findOfficerProfileById(officerId) {
  const officer = getSeedOfficer();

  if (!officer || Number(officerId) !== officer.officer_id) return null;

  return {
    officer_id: officer.officer_id,
    full_name: officer.full_name,
    email: officer.email,
    phone: officer.phone,
    role: officer.role,
    assigned_area: officer.assigned_area,
    profile_image: officer.profile_image
  };
}

module.exports = {
  findOfficerByUsername,
  findOfficerByEmail,
  findOfficerByLogin,
  findOfficerProfileById
};
