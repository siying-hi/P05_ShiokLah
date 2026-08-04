// analyticsController.test.js
const { getTotalOrders } = require("../../controllers/analyticsController");


// Mock response object
function mockRes() {
  return {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };
}

// Mock the model
jest.mock("../../models/analyticsModel", () => ({
  getTotalOrders: jest.fn()
}));

describe("Analytics Controller", () => {
  it("returns total orders when model succeeds", async () => {
    const req = {};
    const res = mockRes();

    const analyticsModel = require("../../models/analyticsModel");
    analyticsModel.getTotalOrders.mockResolvedValue(12);

    await getTotalOrders(req, res);

    expect(res.json).toHaveBeenCalledWith({ total_orders: 12 });
  });

  it("handles DB error gracefully", async () => {
    const req = {};
    const res = mockRes();

    const analyticsModel = require("../../models/analyticsModel");
    analyticsModel.getTotalOrders.mockRejectedValue(new Error("DB error"));

    await getTotalOrders(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Failed to retrieve total orders." });
  });
});
