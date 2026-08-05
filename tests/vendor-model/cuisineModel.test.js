const cuisineModel = require("../../models/cuisineModel");
const sql = require("mssql");
const dbConfig = require("../../dbConfig");

jest.mock("mssql");

//
// ==============================
// Get Vendor Cuisines
// ==============================
//

describe("cuisineModel.getVendorCuisines", () => {

    // Reset all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test Case 1: Successfully retrieve all cuisines
    it("should retrieve all cuisines for the vendor", async () => {

        const vendorId = 1;

        const mockCuisines = [
            {
                cuisine_id: 1,
                cuisine_type: "Chinese",
                default_status: true
            },
            {
                cuisine_id: 5,
                cuisine_type: "Thai",
                default_status: false
            }
        ];

        // Mock SQL request
        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: mockCuisines
            })
        };

        // Mock SQL connection
        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        // Return mocked connection
        sql.connect.mockResolvedValue(mockConnection);

        // Call model function
        const cuisines = await cuisineModel.getVendorCuisines(vendorId);

        // Verify database connection
        expect(sql.connect).toHaveBeenCalledWith(dbConfig);

        // Verify request object was created
        expect(mockConnection.request).toHaveBeenCalledTimes(1);

        // Verify SQL parameter
        expect(mockRequest.input).toHaveBeenCalledWith(
            "vendor_id",
            sql.Int,
            vendorId
        );

        // Verify SQL query executed
        expect(mockRequest.query).toHaveBeenCalled();

        // Verify connection closed
        expect(mockConnection.close).toHaveBeenCalledTimes(1);

        // Verify returned records
        expect(cuisines).toHaveLength(2);

        expect(cuisines[0].cuisine_id).toBe(1);
        expect(cuisines[0].cuisine_type).toBe("Chinese");
        expect(cuisines[0].default_status).toBe(true);

        expect(cuisines[1].cuisine_id).toBe(5);
        expect(cuisines[1].cuisine_type).toBe("Thai");
        expect(cuisines[1].default_status).toBe(false);

    });

    // Test Case 2: Vendor has no cuisines
    it("should return an empty array when no cuisines exist", async () => {

        // Mock SQL request
        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: []
            })
        };

        // Mock SQL connection
        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        // Return mocked connection
        sql.connect.mockResolvedValue(mockConnection);

        // Call model function
        const cuisines = await cuisineModel.getVendorCuisines(1);

        // Verify empty array returned
        expect(cuisines).toEqual([]);

        // Verify connection closed
        expect(mockConnection.close).toHaveBeenCalledTimes(1);

    });

    // Test Case 3: Database error
    it("should throw an error when the database query fails", async () => {

        const errorMessage = "Database Error";

        // Mock connection failure
        sql.connect.mockRejectedValue(
            new Error(errorMessage)
        );

        // Verify error thrown
        await expect(
            cuisineModel.getVendorCuisines(1)
        ).rejects.toThrow(errorMessage);

    });

    // Test Case 4: Invalid vendor ID
    it("should throw an error when vendor ID is invalid", async () => {

        // Verify invalid vendor ID throws error
        await expect(
            cuisineModel.getVendorCuisines(null)
        ).rejects.toThrow("Invalid vendor ID.");

    });

});

//
// ==============================
// Get Cuisine By Vendor Id
// ==============================
//

describe("cuisineModel.getCuisineByVendorId", () => {

    // Reset all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test Case 1: Successfully retrieve current cuisine
    it("should retrieve the current cuisine for the vendor", async () => {

        const vendorId = 1;

        const mockCuisine = {
            cuisine_id: 2,
            cuisine_type: "Japanese",
            default_status: true
        };

        // Mock SQL request
        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: [mockCuisine]
            })
        };

        // Mock SQL connection
        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        // Return mocked connection
        sql.connect.mockResolvedValue(mockConnection);

        // Call model function
        const cuisine = await cuisineModel.getCuisineByVendorId(vendorId);

        // Verify database connection
        expect(sql.connect).toHaveBeenCalledWith(dbConfig);

        // Verify request object created
        expect(mockConnection.request).toHaveBeenCalledTimes(1);

        // Verify SQL parameter
        expect(mockRequest.input).toHaveBeenCalledWith(
            "vendor_id",
            sql.Int,
            vendorId
        );

        // Verify SQL query executed
        expect(mockRequest.query).toHaveBeenCalled();

        // Verify connection closed
        expect(mockConnection.close).toHaveBeenCalledTimes(1);

        // Verify returned cuisine
        expect(cuisine).toEqual(mockCuisine);

    });

    // Test Case 2: Vendor has no assigned cuisine
    it("should return null when the vendor has no assigned cuisine", async () => {

        // Mock SQL request
        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: []
            })
        };

        // Mock SQL connection
        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        // Return mocked connection
        sql.connect.mockResolvedValue(mockConnection);

        // Call model function
        const cuisine = await cuisineModel.getCuisineByVendorId(1);

        // Verify null returned
        expect(cuisine).toBeNull();

        // Verify connection closed
        expect(mockConnection.close).toHaveBeenCalledTimes(1);

    });

    // Test Case 3: Database error
    it("should throw an error when the database query fails", async () => {

        const errorMessage = "Database Error";

        // Mock connection failure
        sql.connect.mockRejectedValue(
            new Error(errorMessage)
        );

        // Verify error thrown
        await expect(
            cuisineModel.getCuisineByVendorId(1)
        ).rejects.toThrow(errorMessage);

    });

    // Test Case 4: Invalid vendor ID
    it("should throw an error when vendor ID is invalid", async () => {

        // Verify invalid vendor ID throws error
        await expect(
            cuisineModel.getCuisineByVendorId(null)
        ).rejects.toThrow("Invalid vendor ID.");

    });

});

//
// ==============================
// Create Cuisine
// ==============================
//

describe("cuisineModel.createCuisine", () => {

    // Reset all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test Case 1: Successfully create cuisine
    it("should create a new cuisine", async () => {

        const cuisine = {
            cuisine_type: "thai",
            vendor_id: 1
        };

        // Mock SQL request
        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                rowsAffected: [1]
            })
        };

        // Mock SQL connection
        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        // Return mocked connection
        sql.connect.mockResolvedValue(mockConnection);

        // Call model function
        const result = await cuisineModel.createCuisine(cuisine);

        // Verify database connection
        expect(sql.connect).toHaveBeenCalledWith(dbConfig);

        // Verify request object created
        expect(mockConnection.request).toHaveBeenCalledTimes(1);

        // Verify cuisine name is converted to title case
        expect(mockRequest.input).toHaveBeenNthCalledWith(
            1,
            "cuisine_type",
            sql.VarChar(20),
            "Thai"
        );

        // Verify vendor id parameter
        expect(mockRequest.input).toHaveBeenNthCalledWith(
            2,
            "vendor_id",
            sql.Int,
            1
        );

        // Verify SQL query executed
        expect(mockRequest.query).toHaveBeenCalled();

        // Verify connection closed
        expect(mockConnection.close).toHaveBeenCalledTimes(1);

        // Verify function returned true
        expect(result).toBe(true);

    });

    // Test Case 2: Multi-word cuisine should be capitalised correctly
    it("should convert cuisine name to title case before inserting", async () => {

        const cuisine = {
            cuisine_type: "south indian",
            vendor_id: 2
        };

        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                rowsAffected: [1]
            })
        };

        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        sql.connect.mockResolvedValue(mockConnection);

        await cuisineModel.createCuisine(cuisine);

        // Verify title case conversion
        expect(mockRequest.input).toHaveBeenNthCalledWith(
            1,
            "cuisine_type",
            sql.VarChar(20),
            "South Indian"
        );

    });

    // Test Case 3: Insert failed
    it("should return false when no rows are inserted", async () => {

        const cuisine = {
            cuisine_type: "Thai",
            vendor_id: 1
        };

        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                rowsAffected: [0]
            })
        };

        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        sql.connect.mockResolvedValue(mockConnection);

        const result = await cuisineModel.createCuisine(cuisine);

        expect(result).toBe(false);

        expect(mockConnection.close).toHaveBeenCalledTimes(1);

    });

    // Test Case 4: Database error
    it("should throw an error when the database query fails", async () => {

        const cuisine = {
            cuisine_type: "Thai",
            vendor_id: 1
        };

        const errorMessage = "Database Error";

        // Mock connection failure
        sql.connect.mockRejectedValue(
            new Error(errorMessage)
        );

        // Verify error thrown
        await expect(
            cuisineModel.createCuisine(cuisine)
        ).rejects.toThrow(errorMessage);

    });

    // Test Case 5: Invalid cuisine data
    it("should throw an error when cuisine data is invalid", async () => {

        // Verify invalid cuisine object throws error
        await expect(
            cuisineModel.createCuisine(null)
        ).rejects.toThrow("Invalid cuisine data.");

    });

});

//
// ==============================
// Update Cuisine
// ==============================
//

describe("cuisineModel.updateCuisine", () => {

    // Reset all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test Case 1: Successfully update cuisine
    it("should update the vendor's cuisine", async () => {

        const vendorId = 1;
        const cuisineId = 3;

        // Mock SQL request
        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                rowsAffected: [1]
            })
        };

        // Mock SQL connection
        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        // Return mocked connection
        sql.connect.mockResolvedValue(mockConnection);

        // Call model function
        const result = await cuisineModel.updateCuisine(
            vendorId,
            cuisineId
        );

        // Verify database connection
        expect(sql.connect).toHaveBeenCalledWith(dbConfig);

        // Verify request object created
        expect(mockConnection.request).toHaveBeenCalledTimes(1);

        // Verify SQL parameters
        expect(mockRequest.input).toHaveBeenNthCalledWith(
            1,
            "vendor_id",
            sql.Int,
            vendorId
        );

        expect(mockRequest.input).toHaveBeenNthCalledWith(
            2,
            "cuisine_id",
            sql.Int,
            cuisineId
        );

        // Verify SQL query executed
        expect(mockRequest.query).toHaveBeenCalled();

        // Verify connection closed
        expect(mockConnection.close).toHaveBeenCalledTimes(1);

        // Verify update successful
        expect(result).toBe(true);

    });

    // Test Case 2: No rows updated
    it("should return false when no cuisine is updated", async () => {

        const mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                rowsAffected: [0]
            })
        };

        const mockConnection = {
            request: jest.fn().mockReturnValue(mockRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        sql.connect.mockResolvedValue(mockConnection);

        const result = await cuisineModel.updateCuisine(
            1,
            3
        );

        expect(result).toBe(false);

        expect(mockConnection.close).toHaveBeenCalledTimes(1);

    });

    // Test Case 3: Database error
    it("should throw an error when the database query fails", async () => {

        const errorMessage = "Database Error";

        // Mock connection failure
        sql.connect.mockRejectedValue(
            new Error(errorMessage)
        );

        // Verify error thrown
        await expect(
            cuisineModel.updateCuisine(
                1,
                3
            )
        ).rejects.toThrow(errorMessage);

    });

    // Test Case 4: Invalid vendor ID
    it("should throw an error when vendor ID is invalid", async () => {

        await expect(
            cuisineModel.updateCuisine(
                null,
                3
            )
        ).rejects.toThrow(
            "Invalid vendor ID or cuisine ID."
        );

    });

    // Test Case 5: Invalid cuisine ID
    it("should throw an error when cuisine ID is invalid", async () => {

        await expect(
            cuisineModel.updateCuisine(
                1,
                null
            )
        ).rejects.toThrow(
            "Invalid vendor ID or cuisine ID."
        );

    });

});

//
// ==============================
// Delete Cuisine
// ==============================
//

describe("cuisineModel.deleteCuisine", () => {

    // Reset all mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test Case 1: Successfully delete cuisine
    it("should delete the specified cuisine", async () => {

        const cuisineId = 5;
        const vendorId = 1;

        // Mock first request (check cuisine usage)
        const mockCheckRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: []
            })
        };

        // Mock second request (delete cuisine)
        const mockDeleteRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                rowsAffected: [1]
            })
        };

        // Mock SQL connection
        const mockConnection = {
            request: jest.fn()
                .mockReturnValueOnce(mockCheckRequest)
                .mockReturnValueOnce(mockDeleteRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        sql.connect.mockResolvedValue(mockConnection);

        // Call model function
        const result = await cuisineModel.deleteCuisine(
            cuisineId,
            vendorId
        );

        // Verify database connection
        expect(sql.connect).toHaveBeenCalledWith(dbConfig);

        // Verify two request objects created
        expect(mockConnection.request).toHaveBeenCalledTimes(2);

        // Verify check query parameter
        expect(mockCheckRequest.input).toHaveBeenCalledWith(
            "id",
            sql.Int,
            cuisineId
        );

        expect(mockCheckRequest.query).toHaveBeenCalled();

        // Verify delete query parameters
        expect(mockDeleteRequest.input).toHaveBeenNthCalledWith(
            1,
            "id",
            sql.Int,
            cuisineId
        );

        expect(mockDeleteRequest.input).toHaveBeenNthCalledWith(2,"vendorId",sql.Int,vendorId);

        expect(mockDeleteRequest.query).toHaveBeenCalled();

        // Verify connection closed
        expect(mockConnection.close).toHaveBeenCalledTimes(1);

        // Verify successful deletion
        expect(result).toBe(true);

    });

    // Test Case 2: Cuisine is currently assigned to a stall
    it("should return false when the cuisine is assigned to a stall", async () => {

        const mockCheckRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: [
                    {
                        cuisine_id: 5
                    }
                ]
            })
        };

        const mockConnection = {
            request: jest.fn()
                .mockReturnValue(mockCheckRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        sql.connect.mockResolvedValue(mockConnection);

        const result = await cuisineModel.deleteCuisine(
            5,
            1
        );

        expect(result).toBe(false);

        // Delete query should never execute
        expect(mockConnection.request).toHaveBeenCalledTimes(1);

        expect(mockConnection.close).toHaveBeenCalledTimes(1);

    });

    // Test Case 3: Cuisine not deleted
    it("should return false when no cuisine is deleted", async () => {

        const mockCheckRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                recordset: []
            })
        };

        const mockDeleteRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn().mockResolvedValue({
                rowsAffected: [0]
            })
        };

        const mockConnection = {
            request: jest.fn()
                .mockReturnValueOnce(mockCheckRequest)
                .mockReturnValueOnce(mockDeleteRequest),
            close: jest.fn().mockResolvedValue(undefined)
        };

        sql.connect.mockResolvedValue(mockConnection);

        const result = await cuisineModel.deleteCuisine(
            5,
            1
        );

        expect(result).toBe(false);

        expect(mockConnection.close).toHaveBeenCalledTimes(1);

    });

    // Test Case 4: Database error
    it("should throw an error when the database query fails", async () => {

        const errorMessage = "Database Error";

        sql.connect.mockRejectedValue(
            new Error(errorMessage)
        );

        await expect(
            cuisineModel.deleteCuisine(
                5,
                1
            )
        ).rejects.toThrow(errorMessage);

    });

    // Test Case 5: Invalid cuisine ID
    it("should throw an error when cuisine ID is invalid", async () => {

        await expect(
            cuisineModel.deleteCuisine(
                null,
                1
            )
        ).rejects.toThrow(
            "Invalid cuisine ID or vendor ID."
        );

    });

    // Test Case 6: Invalid vendor ID
    it("should throw an error when vendor ID is invalid", async () => {

        await expect(
            cuisineModel.deleteCuisine(
                5,
                null
            )
        ).rejects.toThrow(
            "Invalid cuisine ID or vendor ID."
        );

    });

});