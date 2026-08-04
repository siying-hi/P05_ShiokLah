const sql = require("mssql");
const favOrderHistoryModel = require("../../models/favOrderHistoryModel");

// Mock mssql
jest.mock("mssql", () => ({
  connect: jest.fn(),
  Int: "Int",
  VarChar: "VarChar"
}));

describe("Favourite Order History Model", () => {
  let mockRequest;
  let mockConnection;

  beforeEach(() => {
    mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn()
    };

    mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
      close: jest.fn()
    };

    sql.connect.mockResolvedValue(mockConnection);

    jest.clearAllMocks();
  });

  // ==========================
  // getAllFavourites
  // ==========================

  test("getAllFavourites returns favourite list", async () => {
    const favourites = [
      {
        favourite_id: 1,
        order_id: 5,
        custom_name: "Lunch"
      }
    ];

    mockRequest.query.mockResolvedValue({
      recordset: favourites
    });

    const result =
      await favOrderHistoryModel.getAllFavourites(1);

    expect(sql.connect).toHaveBeenCalled();
    expect(mockRequest.input)
      .toHaveBeenCalledWith("patronId", 1);

    expect(result).toEqual(favourites);

    expect(mockConnection.close)
      .toHaveBeenCalled();
  });

  test("getAllFavourites returns empty array", async () => {
    mockRequest.query.mockResolvedValue({
      recordset: []
    });

    const result =
      await favOrderHistoryModel.getAllFavourites(1);

    expect(result).toEqual([]);
  });

  // ==========================
  // getFavouriteById
  // ==========================

  test("getFavouriteById returns favourite", async () => {
    const favourite = {
      favourite_id: 1,
      custom_name: "Dinner"
    };

    mockRequest.query.mockResolvedValue({
      recordset: [favourite]
    });

    const result =
      await favOrderHistoryModel.getFavouriteById(1);

    expect(result).toEqual(favourite);
  });

  test("getFavouriteById returns null if not found", async () => {
    mockRequest.query.mockResolvedValue({
      recordset: []
    });

    const result =
      await favOrderHistoryModel.getFavouriteById(999);

    expect(result).toBeNull();
  });

  // ==========================
  // findByPatronAndOrder
  // ==========================

  test("findByPatronAndOrder returns favourite", async () => {
    const favourite = {
      favourite_id: 2,
      patron_id: 1,
      order_id: 7
    };

    mockRequest.query.mockResolvedValue({
      recordset: [favourite]
    });

    const result =
      await favOrderHistoryModel.findByPatronAndOrder(1, 7);

    expect(mockRequest.input)
      .toHaveBeenCalledWith("patronId", "Int", 1);

    expect(mockRequest.input)
      .toHaveBeenCalledWith("orderId", "Int", 7);

    expect(result).toEqual(favourite);
  });

  test("findByPatronAndOrder returns null when favourite does not exist", async () => {
    mockRequest.query.mockResolvedValue({
      recordset: []
    });

    const result =
      await favOrderHistoryModel.findByPatronAndOrder(1, 999);

    expect(result).toBeNull();
  });

  // ==========================
  // createFavourite
  // ==========================

  test("createFavourite inserts favourite", async () => {
    mockRequest.query.mockResolvedValue({
      recordset: [
        { favourite_id: 10 }
      ]
    });

    const favourite = {
      patronId: 1,
      orderId: 5,
      customName: "Favourite Lunch"
    };

    const result =
      await favOrderHistoryModel.createFavourite(favourite);

    expect(mockRequest.input)
      .toHaveBeenCalledWith("patron_id", "Int", 1);

    expect(mockRequest.input)
      .toHaveBeenCalledWith("order_id", "Int", 5);

    expect(mockRequest.input)
      .toHaveBeenCalledWith(
        "custom_name",
        "VarChar",
        "Favourite Lunch"
      );

    expect(result).toEqual({
      favourite_id: 10,
      ...favourite
    });
  });

  test("createFavourite accepts null customName", async () => {
    mockRequest.query.mockResolvedValue({
      recordset: [
        { favourite_id: 15 }
      ]
    });

    const favourite = {
      patronId: 1,
      orderId: 3
    };

    const result =
      await favOrderHistoryModel.createFavourite(favourite);

    expect(mockRequest.input)
      .toHaveBeenCalledWith(
        "custom_name",
        "VarChar",
        null
      );

    expect(result.favourite_id).toBe(15);
  });

  // ==========================
  // updateFavourite
  // ==========================

  test("updateFavourite updates favourite", async () => {
    const updated = {
      favourite_id: 1,
      custom_name: "Updated Name"
    };

    mockRequest.query.mockResolvedValue({
      recordset: [updated]
    });

    const result =
      await favOrderHistoryModel.updateFavourite({
        id: 1,
        customName: "Updated Name"
      });

    expect(result).toEqual(updated);
  });

  test("updateFavourite returns null when favourite does not exist", async () => {
    mockRequest.query.mockResolvedValue({
      recordset: []
    });

    const result =
      await favOrderHistoryModel.updateFavourite({
        id: 999,
        customName: "Test"
      });

    expect(result).toBeNull();
  });

  // ==========================
  // deleteFavourite
  // ==========================

  test("deleteFavourite deletes favourite", async () => {
    const favourite = {
      favourite_id: 1,
      custom_name: "Delete Me"
    };

    mockRequest.query
      .mockResolvedValueOnce({
        recordset: [favourite]
      })
      .mockResolvedValueOnce({});

    const result =
      await favOrderHistoryModel.deleteFavourite(1);

    expect(result).toEqual(favourite);
  });

  test("deleteFavourite returns null if favourite not found", async () => {
    mockRequest.query.mockResolvedValue({
      recordset: []
    });

    const result =
      await favOrderHistoryModel.deleteFavourite(999);

    expect(result).toBeNull();
  });
});