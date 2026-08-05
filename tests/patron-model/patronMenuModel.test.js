const sql = require("mssql");

const patronMenuModel =
    require("../../models/patronMenuModel");


jest.mock("mssql");


// Get stall unit tests
describe("PatronMenuModel.getStall", () => {

    let mockConnection;
    let mockRequest;

    beforeEach(() => {

        jest.clearAllMocks();

        mockRequest = {

            input: jest.fn().mockReturnThis(),
            query: jest.fn()

        };

        mockConnection = {

            request: jest.fn(() => mockRequest),
            close: jest.fn()

        };

        sql.connect.mockResolvedValue(
            mockConnection
        );

    });


    // --- Test Case 1: Stall found ---
    it("should return the selected stall", async () => {

        const stall = {

            stall_id: 1,
            stall_name: "Ah Tan Chicken Rice",
            image_name: "chicken-rice.jpg",
            rating: 4.5,
            cuisine_type: "Chinese",
            hygiene_grade: "A",
            hygiene_score: 95,
            hygiene_inspection_date: "2026-07-20"

        };

        mockRequest.query.mockResolvedValue({

            recordset: [stall]

        });

        const result =
            await patronMenuModel.getStall(1);

        expect(sql.connect)
            .toHaveBeenCalledWith(
                expect.any(Object)
            );

        expect(mockConnection.request)
            .toHaveBeenCalledTimes(1);

        expect(mockRequest.input)
            .toHaveBeenCalledWith(

                "stallId",
                sql.Int,
                1

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "FROM Stalls s"
                )

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "INNER JOIN Cuisine c"
                )

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "OUTER APPLY"
                )

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "FROM hygiene_grades"
                )

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "WHERE s.stall_id = @stallId"
                )

            );

        expect(result).toEqual(stall);

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Stall not found ---
    it("should return undefined if stall is not found", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: []

        });

        const result =
            await patronMenuModel.getStall(999);

        expect(result).toBeUndefined();

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 3: Stall without hygiene inspection ---
    it("should return stall with null hygiene details", async () => {

        const stall = {

            stall_id: 1,
            stall_name: "Test Stall",
            image_name: "stall.jpg",
            rating: 4,
            cuisine_type: "Asian",
            hygiene_grade: null,
            hygiene_score: null,
            hygiene_inspection_date: null

        };

        mockRequest.query.mockResolvedValue({

            recordset: [stall]

        });

        const result =
            await patronMenuModel.getStall(1);

        expect(result).toEqual(stall);

        expect(result.hygiene_grade)
            .toBeNull();

        expect(result.hygiene_score)
            .toBeNull();

        expect(result.hygiene_inspection_date)
            .toBeNull();

    });


    // --- Test Case 4: Query error ---
    it("should throw an error if stall query fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            patronMenuModel.getStall(1)

        ).rejects.toThrow(
            "Database error"
        );

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 5: Database connection error ---
    it("should throw an error if database connection fails", async () => {

        sql.connect.mockRejectedValue(

            new Error("Database connection failed")

        );

        await expect(

            patronMenuModel.getStall(1)

        ).rejects.toThrow(
            "Database connection failed"
        );

        expect(mockConnection.close)
            .not.toHaveBeenCalled();

    });

});


// Get menu items unit tests
describe("PatronMenuModel.getMenuItems", () => {

    let mockConnection;
    let mockRequest;

    beforeEach(() => {

        jest.clearAllMocks();

        mockRequest = {

            input: jest.fn().mockReturnThis(),
            query: jest.fn()

        };

        mockConnection = {

            request: jest.fn(() => mockRequest),
            close: jest.fn()

        };

        sql.connect.mockResolvedValue(
            mockConnection
        );

    });


    // --- Test Case 1: Menu items found ---
    it("should return all menu items belonging to the stall", async () => {

        const menuItems = [

            {
                item_id: 1,
                item_name: "Chicken Rice",
                price: 5.50,
                food_description: "Roasted chicken rice",
                allergen_info: "Soy",
                estimated_waiting_time: 10,
                image_name: "chicken-rice.jpg",
                visibility: 1
            },

            {
                item_id: 2,
                item_name: "Lemon Tea",
                price: 2.00,
                food_description: "Cold lemon tea",
                allergen_info: null,
                estimated_waiting_time: 3,
                image_name: "lemon-tea.jpg",
                visibility: 1
            }

        ];

        mockRequest.query.mockResolvedValue({

            recordset: menuItems

        });

        const result =
            await patronMenuModel.getMenuItems(1);

        expect(sql.connect)
            .toHaveBeenCalledWith(
                expect.any(Object)
            );

        expect(mockConnection.request)
            .toHaveBeenCalledTimes(1);

        expect(mockRequest.input)
            .toHaveBeenCalledWith(

                "stallId",
                sql.Int,
                1

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "FROM MenuItem"
                )

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "WHERE stall_id = @stallId"
                )

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "ORDER BY item_name"
                )

            );

        expect(result).toEqual(menuItems);

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: No menu items found ---
    it("should return an empty array if stall has no menu items", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: []

        });

        const result =
            await patronMenuModel.getMenuItems(1);

        expect(result).toEqual([]);

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 3: Hidden menu items are still returned ---
    it("should return visibility value for each menu item", async () => {

        const menuItems = [

            {
                item_id: 1,
                item_name: "Visible Item",
                price: 5,
                food_description: "Visible",
                allergen_info: null,
                estimated_waiting_time: 5,
                image_name: "visible.jpg",
                visibility: 1
            },

            {
                item_id: 2,
                item_name: "Hidden Item",
                price: 4,
                food_description: "Hidden",
                allergen_info: null,
                estimated_waiting_time: 5,
                image_name: "hidden.jpg",
                visibility: 0
            }

        ];

        mockRequest.query.mockResolvedValue({

            recordset: menuItems

        });

        const result =
            await patronMenuModel.getMenuItems(1);

        expect(result).toEqual(menuItems);

        expect(result[0].visibility)
            .toBe(1);

        expect(result[1].visibility)
            .toBe(0);

    });


    // --- Test Case 4: Query error ---
    it("should throw an error if menu item query fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            patronMenuModel.getMenuItems(1)

        ).rejects.toThrow(
            "Database error"
        );

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 5: Database connection error ---
    it("should throw an error if database connection fails", async () => {

        sql.connect.mockRejectedValue(

            new Error("Database connection failed")

        );

        await expect(

            patronMenuModel.getMenuItems(1)

        ).rejects.toThrow(
            "Database connection failed"
        );

        expect(mockConnection.close)
            .not.toHaveBeenCalled();

    });

});