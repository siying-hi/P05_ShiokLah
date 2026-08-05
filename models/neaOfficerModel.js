// NEA officer data model: contains database operations for officer accounts.
const db = require("../dbConfig");

const NeaOfficer = {
  create: (data, callback) => {
    const sql = `
      INSERT INTO nea_officers 
      (full_name, email, password, phone, assigned_area)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [data.fullName, data.email, data.password, data.phone, data.assignedArea],
      callback
    );
  },

  findByEmail: (email, callback) => {
    const sql = "SELECT * FROM nea_officers WHERE email = ?";
    db.query(sql, [email], callback);
  },

  findById: (officerId, callback) => {
    const sql = `
      SELECT officer_id, full_name, email, phone, role, assigned_area, profile_image, created_at
      FROM nea_officers
      WHERE officer_id = ?
    `;
    db.query(sql, [officerId], callback);
  }
};

module.exports = NeaOfficer;
