const sql = require("mssql");

const patronHomepageModel =
    require("../../models/patronHomepageModel");


jest.mock("mssql");


// Get patron unit tests
describe("PatronHomepageModel.getPatron", () => {

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


    // --- Test Case 1: Patron found ---
    it("should return the patron's first name", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: [

                {
                    first_name: "Alice"
                }

            ]

        });

        const result =
            await patronHomepageModel.getPatron(1);

        expect(sql.connect)
            .toHaveBeenCalledWith(
                expect.any(Object)
            );

        expect(mockConnection.request)
            .toHaveBeenCalledTimes(1);

        expect(mockRequest.input)
            .toHaveBeenCalledWith(

                "patronId",
                sql.Int,
                1

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "FROM Patrons"
                )

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "WHERE patron_id = @patronId"
                )

            );

        expect(result).toEqual({

            first_name: "Alice"

        });

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: Patron not found ---
    it("should return undefined if patron is not found", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: []

        });

        const result =
            await patronHomepageModel.getPatron(999);

        expect(result).toBeUndefined();

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 3: Query error ---
    it("should throw an error if patron query fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            patronHomepageModel.getPatron(1)

        ).rejects.toThrow(
            "Database error"
        );

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 4: Database connection error ---
    it("should throw an error if database connection fails", async () => {

        sql.connect.mockRejectedValue(

            new Error("Database connection failed")

        );

        await expect(

            patronHomepageModel.getPatron(1)

        ).rejects.toThrow(
            "Database connection failed"
        );

        expect(mockConnection.close)
            .not.toHaveBeenCalled();

    });

});


// Get stalls unit tests
describe("PatronHomepageModel.getStalls", () => {

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


    // --- Test Case 1: Stalls found ---
    it("should return all stalls with cuisine and hygiene grade", async () => {

        const stalls = [

            {
                stall_id: 1,
                stall_name: "Ah Tan Chicken Rice",
                image_name: "chicken-rice.jpg",
                rating: 4.5,
                cuisine_type: "Chinese",
                hygiene_grade: "A"
            },

            {
                stall_id: 2,
                stall_name: "Muthu Curry",
                image_name: "curry.jpg",
                rating: 4.2,
                cuisine_type: "Indian",
                hygiene_grade: "B"
            }

        ];

        mockRequest.query.mockResolvedValue({

            recordset: stalls

        });

        const result =
            await patronHomepageModel.getStalls();

        expect(sql.connect)
            .toHaveBeenCalledWith(
                expect.any(Object)
            );

        expect(mockConnection.request)
            .toHaveBeenCalledTimes(1);

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
                    "ORDER BY inspection_date DESC"
                )

            );

        expect(mockRequest.query)
            .toHaveBeenCalledWith(

                expect.stringContaining(
                    "ORDER BY s.stall_name"
                )

            );

        expect(result).toEqual(stalls);

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 2: No stalls found ---
    it("should return an empty array if no stalls are found", async () => {

        mockRequest.query.mockResolvedValue({

            recordset: []

        });

        const result =
            await patronHomepageModel.getStalls();

        expect(result).toEqual([]);

        expect(mockConnection.close)
            .toHaveBeenCalledTimes(1);

    });


    // --- Test Case 3: Stall without hygiene grade ---
    it("should return a stall even if hygiene grade is null", async () => {

        const stalls = [

            {
                stall_id: 1,
                stall_name: "Test Stall",
                image_name: "stall.jpg",
                rating: 4,
                cuisine_type: "Asian",
                hygiene_grade: null
            }

        ];

        mockRequest.query.mockResolvedValue({

            recordset: stalls

        });

        const result =
            await patronHomepageModel.getStalls();

        expect(result).toEqual(stalls);

        expect(result[0].hygiene_grade)
            .toBeNull();

    });


    // --- Test Case 4: Query error ---
    it("should throw an error if stall query fails", async () => {

        mockRequest.query.mockRejectedValue(

            new Error("Database error")

        );

        await expect(

            patronHomepageModel.getStalls()

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

            patronHomepageModel.getStalls()

        ).rejects.toThrow(
            "Database connection failed"
        );

        expect(mockConnection.close)
            .not.toHaveBeenCalled();

    });

});