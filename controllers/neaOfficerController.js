// NEA officer controller: validates requests and coordinates profile/account responses.
const sql = require("mssql");
const bcrypt = require("bcryptjs");

exports.signupOfficer = async (req, res) => {
  try {
    const { fullName, email, password, phone, assignedArea } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Full name, email and password are required." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await sql.connect();

    const result = await pool.request()
      .input("fullName", sql.VarChar, fullName)
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, hashedPassword)
      .input("phone", sql.VarChar, phone || null)
      .input("assignedArea", sql.VarChar, assignedArea || null)
      .query(`
        INSERT INTO nea_officers 
        (full_name, email, password, phone, assigned_area)
        OUTPUT INSERTED.officer_id
        VALUES (@fullName, @email, @password, @phone, @assignedArea)
      `);

    const officerId = result.recordset[0].officer_id;

    req.session.officerId = officerId;

    res.status(201).json({
      message: "NEA officer account created successfully.",
      officerId
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create NEA officer account.",
      error: error.message
    });
  }
};

exports.getOfficerProfile = async (req, res) => {
  try {
    const officerId = req.session.officerId;

    if (!officerId) {
      return res.status(401).json({ message: "Please login first." });
    }

    const pool = await sql.connect();

    const result = await pool.request()
      .input("officerId", sql.Int, officerId)
      .query(`
        SELECT officer_id, full_name, email, phone, role, assigned_area, profile_image, created_at
        FROM nea_officers
        WHERE officer_id = @officerId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Officer profile not found." });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load officer profile.",
      error: error.message
    });
  }
};
