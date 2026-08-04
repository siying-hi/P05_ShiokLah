jest.mock("mssql", () => ({
  connect: jest.fn(),
  VarChar: "VarChar",
  Int: "Int"
}));
jest.mock("bcryptjs", () => ({ hash: jest.fn() }));

const sql = require("mssql");
const bcrypt = require("bcryptjs");
const { signupOfficer, getOfficerProfile } = require("../../controllers/neaOfficerController");

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
}

function createPool(recordset = []) {
  const request = {
    input: jest.fn().mockReturnThis(),
    query: jest.fn().mockResolvedValue({ recordset })
  };
  return { pool: { request: jest.fn(() => request) }, request };
}

describe("NEA officer controller", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("signupOfficer", () => {
    test("rejects missing required fields", async () => {
      const req = { body: { fullName: "Jane Tan" }, session: {} };
      const res = createResponse();

      await signupOfficer(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Full name, email and password are required."
      });
      expect(sql.connect).not.toHaveBeenCalled();
    });

    test("hashes the password, creates the officer and starts a session", async () => {
      const req = {
        body: {
          fullName: "Jane Tan",
          email: "jane@nea.gov.sg",
          password: "Secret123",
          phone: "91234567",
          assignedArea: "Jurong West"
        },
        session: {}
      };
      const res = createResponse();
      const { pool, request } = createPool([{ officer_id: 7 }]);
      bcrypt.hash.mockResolvedValue("hashed-password");
      sql.connect.mockResolvedValue(pool);

      await signupOfficer(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith("Secret123", 10);
      expect(request.input).toHaveBeenCalledWith("password", sql.VarChar, "hashed-password");
      expect(req.session.officerId).toBe(7);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "NEA officer account created successfully.",
        officerId: 7
      });
    });

    test("returns 500 when account creation fails", async () => {
      const req = {
        body: { fullName: "Jane", email: "jane@nea.gov.sg", password: "Secret123" },
        session: {}
      };
      const res = createResponse();
      bcrypt.hash.mockResolvedValue("hash");
      sql.connect.mockRejectedValue(new Error("database unavailable"));

      await signupOfficer(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to create NEA officer account.",
        error: "database unavailable"
      });
    });
  });

  describe("getOfficerProfile", () => {
    test("requires an officer session", async () => {
      const res = createResponse();

      await getOfficerProfile({ session: {} }, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Please login first." });
    });

    test("returns the logged-in officer profile", async () => {
      const profile = { officer_id: 3, full_name: "Jane Tan", assigned_area: "West" };
      const { pool, request } = createPool([profile]);
      sql.connect.mockResolvedValue(pool);
      const res = createResponse();

      await getOfficerProfile({ session: { officerId: 3 } }, res);

      expect(request.input).toHaveBeenCalledWith("officerId", sql.Int, 3);
      expect(res.json).toHaveBeenCalledWith(profile);
    });

    test("returns 404 when the profile does not exist", async () => {
      const { pool } = createPool([]);
      sql.connect.mockResolvedValue(pool);
      const res = createResponse();

      await getOfficerProfile({ session: { officerId: 99 } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Officer profile not found." });
    });
  });
});
