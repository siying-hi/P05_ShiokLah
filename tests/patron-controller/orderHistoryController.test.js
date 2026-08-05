const controller = require("../../controllers/orderHistoryController");
const orderHistoryModel = require("../../models/orderHistoryModel");
const favouriteModel = require("../../models/favOrderHistoryModel");

jest.mock("../../models/orderHistoryModel");
jest.mock("../../models/favOrderHistoryModel");

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("OrderHistoryController", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
      console.error.mockRestore();
  });



  test("getOrderHistory groups items into one order", async () => {
    const req = { user: { id: 1 } };
    const res = mockResponse();

    orderHistoryModel.getOrdersByPatron.mockResolvedValue([
        
      {
        order_id: 1,
        item_name: "Chicken Rice",
        quantity: 1,
        price: 5
      },
      {
        order_id: 1,
        item_name: "Egg",
        quantity: 2,
        price: 1
      }
    
    ]);

    await controller.getOrderHistory(req, res);

    const result = res.json.mock.calls[0][0];

    expect(result.orders).toHaveLength(1);
    expect(result.orders[0].items).toHaveLength(2);
    expect(result.orders[0].total_amt).toBe(7);
});
  // ==========================
  // GET ORDER HISTORY
  // ==========================

  test("getOrderHistory returns grouped orders", async () => {
    const req = { user: { id: 1 } };
    const res = mockResponse();

    orderHistoryModel.getOrdersByPatron.mockResolvedValue([
      {
        order_id: 1,
        history_id: 10,
        order_date: "2026-08-01",
        order_status: "Completed",
        item_id: 101,
        item_name: "Chicken Rice",
        quantity: 2,
        price: 5
      }
    ]);

    await controller.getOrderHistory(req, res);

    expect(res.json).toHaveBeenCalled();

    const result = res.json.mock.calls[0][0];

    expect(result.orders).toHaveLength(1);
    expect(result.orders[0].items[0].item_name).toBe("Chicken Rice");
  });

  test("getOrderHistory returns empty array when no orders", async () => {

    const req = { user: { id: 1 } };
    const res = mockResponse();

    orderHistoryModel.getOrdersByPatron.mockResolvedValue([]);

    await controller.getOrderHistory(req, res);

    expect(res.json).toHaveBeenCalledWith({
      orders: []
    });

  });

  test("getOrderHistory returns 500 when database fails", async () => {

    const req = { user: { id: 1 } };
    const res = mockResponse();

    orderHistoryModel.getOrdersByPatron.mockRejectedValue(
      new Error("DB Error")
    );

    await controller.getOrderHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
        orders: []
    });
  })

  // ==========================
  // FILTER ORDERS
  // ==========================

  test("filterOrders returns filtered orders", async () => {

    const req = {
      user: { id: 1 },
      query: {
        status: "Pending"
      }
    };

    const res = mockResponse();

    orderHistoryModel.filterOrders.mockResolvedValue([
      {
        order_id: 2,
        history_id: 11,
        order_date: "2026-08-01",
        order_status: "Pending",
        item_id: 5,
        item_name: "Laksa",
        quantity: 1,
        price: 6
      }
    ]);

    await controller.filterOrders(req, res);

    expect(res.json).toHaveBeenCalled();

    const result = res.json.mock.calls[0][0];

    expect(result.orders).toHaveLength(1);
    expect(result.orders[0].order_status).toBe("Pending");
    expect(result.orders[0].items[0].item_name).toBe("Laksa");

  });

  test("filterOrders returns empty list", async () => {

    const req = {
      user: { id: 1 },
      query: {}
    };

    const res = mockResponse();

    orderHistoryModel.filterOrders.mockResolvedValue([]);

    await controller.filterOrders(req, res);

    expect(res.json).toHaveBeenCalledWith({
    orders: []
});

  });

  test("filterOrders returns 500 on database error", async () => {

    const req = {
      user: { id: 1 },
      query: {}
    };

    const res = mockResponse();

    orderHistoryModel.filterOrders.mockRejectedValue(
      new Error("DB Error")
    );

    await controller.filterOrders(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
        message:"Failed to filter orders."
    });

  });

  // ==========================
  // GET ORDER BY ID
  // ==========================

  test("getOrderById returns order", async () => {

    const req = {
      user: { id: 1 },
      params: {
        id: 1
      }
    };

    const res = mockResponse();

    orderHistoryModel.getOrderById.mockResolvedValue([
    {
        order_id: 1,
        patron_id: 1,
        item_name: "Chicken Rice"
    }
]);

    await controller.getOrderById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith([
        {
            order_id: 1,
            patron_id: 1,
            item_name: "Chicken Rice"
        }
    ]);
  });

  test("getOrderById returns 404 when order not found", async () => {

    const req = {
      user: { id: 1 },
      params: {
        id: 99
      }
    };

    const res = mockResponse();

    orderHistoryModel.getOrderById.mockResolvedValue(null);

    await controller.getOrderById(req, res);

  
    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
        message: "Order not found."
    });

  });

  test("getOrderById returns 500 on database error", async () => {

    const req = {
      user: { id: 1 },
      params: {
        id: 1
      }
    };

    const res = mockResponse();

    orderHistoryModel.getOrderById.mockRejectedValue(
      new Error("DB Error")
    );

    await controller.getOrderById(req, res);

    expect(res.json).toHaveBeenCalledWith({
    message: "Failed to retrieve order."
});

  });

  // ==========================
  // GET ALL FAVOURITES
  // ==========================

  test("getAllFavourites returns favourites", async () => {

    const req = {
      user: { id: 1 }
    };

    const res = mockResponse();

    favouriteModel.getAllFavourites.mockResolvedValue([
      {
        favourite_id: 1
      }
    ]);

    await controller.getAllFavourites(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

  });

  test("getAllFavourites returns empty list", async () => {

    const req = {
      user: { id: 1 }
    };

    const res = mockResponse();

    favouriteModel.getAllFavourites.mockResolvedValue([]);

    await controller.getAllFavourites(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

  });

  test("getAllFavourites returns 500", async () => {

    const req = {
      user: { id: 1 }
    };

    const res = mockResponse();

    favouriteModel.getAllFavourites.mockRejectedValue(
      new Error("DB Error")
    );

    await controller.getAllFavourites(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

  });

  // ==========================
  // GET FAVOURITE BY ID
  // ==========================

  test("getFavouriteById returns favourite", async () => {

    const req = {
      params: {
        id: 1
      }
    };

    const res = mockResponse();

    favouriteModel.getFavouriteById.mockResolvedValue({
      favourite_id: 1
    });

    await controller.getFavouriteById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

  });

  test("getFavouriteById returns 404", async () => {

    const req = {
      params: {
        id: 99
      }
    };

    const res = mockResponse();

    favouriteModel.getFavouriteById.mockResolvedValue(null);

    await controller.getFavouriteById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);

  });

  // ==========================
  // CREATE FAVOURITE
  // ==========================

  test("createFavourite creates favourite successfully", async () => {

    const req = {
      user: { id: 1 },
      body: {
        orderId: 1,
        customName: "Lunch"
      }
    };

    const res = mockResponse();

    orderHistoryModel.getOrderById.mockResolvedValue([{ order_id: 1 }]);

    favouriteModel.findByPatronAndOrder.mockResolvedValue(null);

    favouriteModel.createFavourite.mockResolvedValue({
      favourite_id: 1
    });

    await controller.createFavourite(req, res);

    expect(res.status).toHaveBeenCalledWith(201);

  });

  test("createFavourite returns 400 when order does not exist", async () => {

    const req = {
      user: { id: 1 },
      body: {
        orderId: 999
      }
    };

    const res = mockResponse();

    orderHistoryModel.getOrderById.mockResolvedValue(null);

    await controller.createFavourite(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
        message: "Order does not exist."
    });

  });

  test("createFavourite returns 400 when already favourited", async () => {

    const req = {
      user: { id: 1 },
      body: {
        orderId: 1
      }
    };

    const res = mockResponse();

    orderHistoryModel.getOrderById.mockResolvedValue([{ order_id: 1 }]);

    favouriteModel.findByPatronAndOrder.mockResolvedValue({
      favourite_id: 3
    });

    await controller.createFavourite(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    

  });

  test("createFavourite returns 500 when database throws error", async () => {

    const req = {
      user: { id: 1 },
      body: {
        orderId: 1
      }
    };

    const res = mockResponse();

    orderHistoryModel.getOrderById.mockRejectedValue(
      new Error("DB Error")
    );

    await controller.createFavourite(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
        message: "Unable to create favourite."
    });

  });

  // ==========================
  // UPDATE
  // ==========================

  test("updateFavourite updates favourite", async () => {

    const req = {
      params: {
        id: 1
      },
      body: {
        customName: "Dinner"
      }
    };

    const res = mockResponse();

    favouriteModel.updateFavourite.mockResolvedValue({
      favourite_id: 1
    });

    await controller.updateFavourite(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

  });

  test("updateFavourite returns 404", async () => {

    const req = {
      params: {
        id: 1
      },
      body: {
        customName: "Dinner"
      }
    };

    const res = mockResponse();

    favouriteModel.updateFavourite.mockResolvedValue(null);

    await controller.updateFavourite(req, res);

    expect(res.json).toHaveBeenCalledWith({
    message: "Favourite not found."
});

  });

  // ==========================
  // DELETE
  // ==========================

  test("deleteFavourite deletes favourite", async () => {

    const req = {
      params: {
        id: 1
      }
    };

    const res = mockResponse();

    favouriteModel.deleteFavourite.mockResolvedValue({
      favourite_id: 1
    });

    await controller.deleteFavourite(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

  });

  test("deleteFavourite returns 404", async () => {

    const req = {
      params: {
        id: 1
      }
    };

    const res = mockResponse();

    favouriteModel.deleteFavourite.mockResolvedValue(null);

    await controller.deleteFavourite(req, res);

    expect(res.json).toHaveBeenCalledWith({
    message: "Favourite not found."
});

  });

});

