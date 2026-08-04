// tests/models/orderHistoryModel.test.js

const sql = require("mssql");
const dbConfig = require("../../dbConfig");
const orderHistoryModel = require("../../models/orderHistoryModel");

jest.mock("mssql", () => ({
    connect: jest.fn(),
    Int: "Int"
}));

describe("Order History Model", () => {

    let mockRequest;
    let mockConnection;

    beforeEach(() => {

        mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn()
        };

        mockConnection = {
            request: jest.fn(() => mockRequest),
            close: jest.fn()
        };

        sql.connect.mockResolvedValue(mockConnection);

        jest.clearAllMocks();
    });


    // =====================================
    // getOrdersByPatron
    // =====================================

    test("getOrdersByPatron returns all orders", async () => {

        const rows = [
            {
                history_id: 5,
                order_id: 10
            }
        ];

        mockRequest.query.mockResolvedValue({
            recordset: rows
        });

        const result =
            await orderHistoryModel.getOrdersByPatron(1);

        expect(result).toEqual(rows);

        expect(mockConnection.close).toHaveBeenCalled();

    });

    test("getOrdersByPatron returns empty list", async () => {

        mockRequest.query.mockResolvedValue({
            recordset: []
        });

        const result =
            await orderHistoryModel.getOrdersByPatron(1);

        expect(result).toEqual([]);

    });

    // =====================================
    // filterOrders
    // =====================================

    test("filterOrders returns filtered orders", async () => {

        const rows = [
            {
                order_id: 3,
                order_status: "Completed"
            }
        ];

        mockRequest.query.mockResolvedValue({
            recordset: rows
        });

        const result =
            await orderHistoryModel.filterOrders(
                1,
                "Completed",
                null,
                null
            );

        expect(result).toEqual(rows);

    });

    test("filterOrders returns empty list", async () => {

        mockRequest.query.mockResolvedValue({
            recordset: []
        });

        const result =
            await orderHistoryModel.filterOrders(
                1,
                "Pending",
                null,
                null
            );

        expect(result).toEqual([]);

    });

    test("filterOrders works with date range", async () => {

        mockRequest.query.mockResolvedValue({
            recordset: []
        });

        await orderHistoryModel.filterOrders(
            1,
            null,
            "2026-01-01",
            "2026-12-31"
        );

        expect(mockRequest.input).toHaveBeenCalledWith(
            "startDate",
            "2026-01-01"
        );

        expect(mockRequest.input).toHaveBeenCalledWith(
            "endDate",
            "2026-12-31"
        );

    });

    // =====================================
    // getOrderById
    // =====================================

    test("getOrderById returns matching order", async () => {

        const rows = [
            {
                order_id: 5
            }
        ];

        mockRequest.query.mockResolvedValue({
            recordset: rows
        });

        const result = await orderHistoryModel.getOrderById(5, 1);

        expect(result).toEqual(rows);
    });

    test("getOrderById returns null when not found", async () => {

        mockRequest.query.mockResolvedValue({
            recordset: []
        });

        const result =
            await orderHistoryModel.getOrderById(
                100,
                1
            );

        expect(result).toBeNull();

    });

    // =====================================
    // Database Errors
    // =====================================

    test("getOrdersByPatron throws database error", async () => {

        mockRequest.query.mockRejectedValue(
            new Error("Database Error")
        );

        await expect(
            orderHistoryModel.getOrdersByPatron(1)
        ).rejects.toThrow("Database Error");

    });

    test("getOrderById throws database error", async () => {

        mockRequest.query.mockRejectedValue(
            new Error("Database Error")
        );

        await expect(
            orderHistoryModel.getOrderById(1, 1)
        ).rejects.toThrow("Database Error");

    });

    test("filterOrders throws database error", async () => {

        mockRequest.query.mockRejectedValue(
            new Error("Database Error")
        );

        await expect(
            orderHistoryModel.filterOrders(
                1,
                null,
                null,
                null
            )
        ).rejects.toThrow("Database Error");

    });

});

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    console.error.mockRestore();
});