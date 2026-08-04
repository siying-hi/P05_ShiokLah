jest.mock("mssql", () => ({ connect: jest.fn() }));
jest.mock("../../models/hygieneModel");
jest.mock("../../models/seedHygieneFallback");
jest.mock("../../models/seedOfficerFallback");
jest.mock("../../models/vendorNotificationStore");
jest.mock("../../models/patronNotificationStore");

const sql = require("mssql");
const HygieneGrade = require("../../models/hygieneModel");
const seedHygieneFallback = require("../../models/seedHygieneFallback");
const seedOfficerFallback = require("../../models/seedOfficerFallback");
const vendorNotificationStore = require("../../models/vendorNotificationStore");
const patronNotificationStore = require("../../models/patronNotificationStore");
const hygieneController = require("../../controllers/hygieneController");

function createResponse() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

function mockOfficerLookup(name = "Jane Tan") {
  const request = {
    input: jest.fn().mockReturnThis(),
    query: jest.fn().mockResolvedValue({ recordset: [{ full_name: name }] })
  };
  sql.connect.mockResolvedValue({ request: jest.fn(() => request) });
}

describe("NEA hygiene grade controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    vendorNotificationStore.addNotification.mockReturnValue({ id: 10, type: "hygiene-grade" });
    patronNotificationStore.resolveHygieneAlerts.mockReturnValue(undefined);
    patronNotificationStore.addGradeDAlert.mockReturnValue({ id: 20, grade: "D" });
  });

  test("rejects a grade outside A to D", async () => {
    const req = { params: { stallId: "1" }, body: { hygieneGrade: "E", inspectionDate: "2026-08-02" } };
    const res = createResponse();

    await hygieneController.recordHygieneGrade(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(HygieneGrade.create).not.toHaveBeenCalled();
  });

  test("requires an inspection date", async () => {
    const req = { params: { stallId: "1" }, body: { hygieneGrade: "A" } };
    const res = createResponse();

    await hygieneController.recordHygieneGrade(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Inspection date is required." });
  });

  test("records Grade B, notifies the vendor and does not alert patrons", async () => {
    mockOfficerLookup();
    HygieneGrade.create.mockResolvedValue(41);
    HygieneGrade.getStallNotificationContext.mockResolvedValue({
      stall_id: 1,
      stall_name: "Banana Leaf Nasi Lemak",
      vendor_id: 5
    });
    const req = {
      session: { officerId: 2 },
      params: { stallId: "1" },
      body: { hygieneGrade: "b", score: 86, inspectionDate: "2026-08-02", remarks: "Good" }
    };
    const res = createResponse();

    await hygieneController.recordHygieneGrade(req, res);

    expect(HygieneGrade.create).toHaveBeenCalledWith(expect.objectContaining({
      hygieneGrade: "B",
      inspectionBy: "Jane Tan"
    }));
    expect(vendorNotificationStore.addNotification).toHaveBeenCalledWith(
      expect.objectContaining({ vendorId: 5, grade: "B", type: "hygiene-grade" })
    );
    expect(patronNotificationStore.resolveHygieneAlerts).toHaveBeenCalledWith(1);
    expect(patronNotificationStore.addGradeDAlert).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("records Grade D and creates the patron warning", async () => {
    mockOfficerLookup();
    HygieneGrade.create.mockResolvedValue(42);
    HygieneGrade.getStallNotificationContext.mockResolvedValue({
      stall_id: 2,
      stall_name: "Test Stall",
      vendor_id: 8
    });
    const req = {
      session: { officerId: 2 },
      params: { stallId: "2" },
      body: { hygieneGrade: "D", score: 45, inspectionDate: "2026-08-02", remarks: "Critical issue" }
    };
    const res = createResponse();

    await hygieneController.recordHygieneGrade(req, res);

    expect(patronNotificationStore.addGradeDAlert).toHaveBeenCalledWith({
      hygieneId: 42,
      stallId: 2,
      stallName: "Test Stall",
      score: 45,
      inspectionDate: "2026-08-02",
      remarks: "Critical issue"
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      hygieneId: 42,
      patronAlert: { id: 20, grade: "D" }
    }));
  });

  test("returns 404 when an edited hygiene entry is missing", async () => {
    HygieneGrade.getById.mockResolvedValue(null);
    mockOfficerLookup();
    HygieneGrade.update.mockResolvedValue(null);
    const req = {
      session: { officerId: 2 },
      params: { hygieneId: "999" },
      body: { hygieneGrade: "A", inspectionDate: "2026-08-02" }
    };
    const res = createResponse();

    await hygieneController.updateHygieneGrade(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Hygiene grade entry not found." });
  });

  test("uses seed data when SQL is unavailable", async () => {
    HygieneGrade.getAllWithLatestGrade.mockRejectedValue(Object.assign(new Error("login failed"), { code: "ELOGIN" }));
    seedHygieneFallback.getAllWithLatestGrade.mockReturnValue([{ stall_id: 1, hygiene_grade: "A" }]);
    const res = createResponse();

    await hygieneController.getAllHygieneGrades({}, res);

    expect(res.json).toHaveBeenCalledWith([{ stall_id: 1, hygiene_grade: "A" }]);
  });

  test("deletes a hygiene entry", async () => {
    HygieneGrade.deleteEntry.mockResolvedValue({ hygiene_id: 4 });
    const res = createResponse();

    await hygieneController.deleteHygieneGrade({ params: { hygieneId: "4" } }, res);

    expect(res.json).toHaveBeenCalledWith({ message: "Hygiene grade deleted successfully." });
  });
});
