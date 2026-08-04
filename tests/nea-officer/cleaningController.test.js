jest.mock("../../models/cleaningModel");
jest.mock("../../models/vendorNotificationStore");

const cleaningModel = require("../../models/cleaningModel");
const vendorNotificationStore = require("../../models/vendorNotificationStore");
const cleaningController = require("../../controllers/cleaningController");

function createResponse() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

describe("NEA cleaning review controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    vendorNotificationStore.addNotification.mockImplementation((notification) => ({ id: 1, ...notification }));
  });

  test("loads cleaning submissions", async () => {
    cleaningModel.getCleaningSubmissions.mockResolvedValue([{ id: 1, status: "pending" }]);
    const res = createResponse();

    await cleaningController.getCleaningSubmissions({}, res);

    expect(res.json).toHaveBeenCalledWith([{ id: 1, status: "pending" }]);
  });

  test("rejects an invalid submission id", async () => {
    const res = createResponse();

    await cleaningController.reviewCleaningSubmission({
      params: { submissionId: "abc" }, body: { status: "approved", remarks: "Clear" }, session: {}
    }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(cleaningModel.reviewCleaningSubmission).not.toHaveBeenCalled();
  });

  test("rejects an unsupported decision", async () => {
    const res = createResponse();

    await cleaningController.reviewCleaningSubmission({
      params: { submissionId: "5" }, body: { status: "waiting", remarks: "Reviewing" }, session: {}
    }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Status must be approved or rejected." });
  });

  test("requires an officer reason", async () => {
    const res = createResponse();

    await cleaningController.reviewCleaningSubmission({
      params: { submissionId: "5" }, body: { status: "approved", remarks: "   " }, session: {}
    }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "A review reason is required." });
  });

  test("approves a submission and notifies its vendor", async () => {
    cleaningModel.reviewCleaningSubmission.mockResolvedValue({
      id: 5,
      vendorId: "V-12",
      vendorEmail: "vendor@example.com",
      stall: "Test Stall",
      status: "approved"
    });
    const res = createResponse();

    await cleaningController.reviewCleaningSubmission({
      params: { submissionId: "5" },
      body: { status: "approved", remarks: "Watermark is clear." },
      session: { officerId: 3 }
    }, res);

    expect(cleaningModel.reviewCleaningSubmission).toHaveBeenCalledWith(5, {
      status: "approved",
      remarks: "Watermark is clear.",
      reviewedBy: "Officer 3"
    });
    expect(vendorNotificationStore.addNotification).toHaveBeenCalledWith(
      expect.objectContaining({ vendorId: 12, status: "approved", dueDate: null })
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Cleaning submission approved."
    }));
  });

  test("rejects a submission with a resubmission deadline", async () => {
    cleaningModel.reviewCleaningSubmission.mockResolvedValue({
      id: 6,
      vendorId: "V-9",
      vendorEmail: "vendor@example.com",
      vendorName: "Vendor",
      stall: "Test Stall",
      status: "rejected"
    });
    const res = createResponse();

    await cleaningController.reviewCleaningSubmission({
      params: { submissionId: "6" },
      body: { status: "rejected", remarks: "Photo is unclear.", dueDate: "2026-08-08" },
      session: { officerId: 4 }
    }, res);

    expect(vendorNotificationStore.addNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        vendorId: 9,
        status: "rejected",
        dueDate: "2026-08-08",
        reason: "Photo is unclear."
      })
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Cleaning submission rejected. Resubmission notification sent to vendor@example.com.",
      emailNotification: expect.objectContaining({ dueDate: "2026-08-08" })
    }));
  });

  test("returns 404 when the submission is missing", async () => {
    cleaningModel.reviewCleaningSubmission.mockResolvedValue(null);
    const res = createResponse();

    await cleaningController.reviewCleaningSubmission({
      params: { submissionId: "88" }, body: { status: "approved", remarks: "Clear" }, session: {}
    }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Cleaning submission not found." });
  });
});
