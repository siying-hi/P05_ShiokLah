const cuisineController = require("../../controllers/cuisineController");
const cuisineModel = require("../../models/cuisineModel");

jest.mock("../../models/cuisineModel");

describe("cuisineController", () => {

    let req;
    let res;

    beforeEach(() => {

        jest.clearAllMocks();

        req = {
            user: {
                id: 1
            },
            params: {},
            body: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

    });

    //
    // ==============================
    // getVendorCuisines
    // ==============================
    //

    describe("getVendorCuisines", () => {

        // Test Case 1: Successfully retrieve cuisines
        it("should return all cuisines for the vendor", async () => {

            const cuisines = [
                {
                    cuisine_id: 1,
                    cuisine_type: "Chinese",
                    default_status: 1
                },
                {
                    cuisine_id: 5,
                    cuisine_type: "Peranakan",
                    default_status: 0
                }
            ];

            cuisineModel.getVendorCuisines.mockResolvedValue(cuisines);

            await cuisineController.getVendorCuisines(req, res);

            // Verify model function called
            expect(cuisineModel.getVendorCuisines)
                .toHaveBeenCalledWith(1);

            // Verify response
            expect(res.json)
                .toHaveBeenCalledWith(cuisines);

        });

        // Test Case 2: Server error
        it("should return 500 when the model throws an error", async () => {

            cuisineModel.getVendorCuisines.mockRejectedValue(
                new Error("Database Error")
            );

            await cuisineController.getVendorCuisines(req, res);

            // Verify status code
            expect(res.status)
                .toHaveBeenCalledWith(500);

            // Verify response
            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Unable to load cuisines."
                });

        });

    });

    //
    // ==============================
    // getCuisine
    // ==============================
    //

    describe("getCuisine", () => {

        beforeEach(() => {

            jest.clearAllMocks();

            req.user = {
                id: 1
            };

        });

        // Test Case 1: Successfully retrieve current cuisine
        it("should return the vendor's current cuisine", async () => {

            const cuisine = {
                cuisine_id: 2,
                cuisine_type: "Chinese",
                default_status: 1
            };

            cuisineModel.getCuisineByVendorId.mockResolvedValue(cuisine);

            await cuisineController.getCuisine(req, res);

            // Verify model function called
            expect(cuisineModel.getCuisineByVendorId)
                .toHaveBeenCalledWith(1);

            // Verify response
            expect(res.json)
                .toHaveBeenCalledWith(cuisine);

        });

        // Test Case 2: Cuisine not found
        it("should return 404 when the vendor has no cuisine", async () => {

            cuisineModel.getCuisineByVendorId.mockResolvedValue(null);

            await cuisineController.getCuisine(req, res);

            // Verify model function called
            expect(cuisineModel.getCuisineByVendorId)
                .toHaveBeenCalledWith(1);

            // Verify status code
            expect(res.status)
                .toHaveBeenCalledWith(404);

            // Verify response
            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Cuisine not found."
                });

        });

        // Test Case 3: Server error
        it("should return 500 when the model throws an error", async () => {

            cuisineModel.getCuisineByVendorId.mockRejectedValue(
                new Error("Database Error")
            );

            await cuisineController.getCuisine(req, res);

            // Verify status code
            expect(res.status)
                .toHaveBeenCalledWith(500);

            // Verify response
            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Unable to retrieve cuisine."
                });

        });

    });

    //
    // ==============================
    // createCuisine
    // ==============================
    //

    describe("createCuisine", () => {

        beforeEach(() => {

            jest.clearAllMocks();

            req.user = {
                id: 1
            };

            req.body = {
                cuisine_type: "Peranakan"
            };

        });

        // Test Case 1: Successfully create cuisine
        it("should create a new cuisine", async () => {

            cuisineModel.cuisineExists.mockResolvedValue(false);

            cuisineModel.createCuisine.mockResolvedValue(true);

            await cuisineController.createCuisine(req, res);

            // Verify duplicate check
            expect(cuisineModel.cuisineExists)
                .toHaveBeenCalledWith("Peranakan");

            // Verify create function called
            expect(cuisineModel.createCuisine)
                .toHaveBeenCalledWith({
                    cuisine_type: "Peranakan",
                    vendor_id: 1
                });

            // Verify response
            expect(res.status)
                .toHaveBeenCalledWith(201);

            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Cuisine created successfully."
                });

        });

        // Test Case 2: Duplicate cuisine
        it("should return 409 when cuisine already exists", async () => {

            cuisineModel.cuisineExists.mockResolvedValue(true);

            await cuisineController.createCuisine(req, res);

            // Verify duplicate check
            expect(cuisineModel.cuisineExists)
                .toHaveBeenCalledWith("Peranakan");

            // Verify create function not called
            expect(cuisineModel.createCuisine)
                .not.toHaveBeenCalled();

            // Verify response
            expect(res.status)
                .toHaveBeenCalledWith(409);

            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Cuisine already exists."
                });

        });

        // Test Case 3: Server error
        it("should return 500 when the model throws an error", async () => {

            cuisineModel.cuisineExists.mockRejectedValue(
                new Error("Database Error")
            );

            await cuisineController.createCuisine(req, res);

            // Verify status code
            expect(res.status)
                .toHaveBeenCalledWith(500);

            // Verify response
            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Failed to create cuisine."
                });

        });

    });

    //
    // ==============================
    // updateCuisine
    // ==============================
    //

    describe("updateCuisine", () => {

        beforeEach(() => {

            jest.clearAllMocks();

            req.user = {
                id: 1
            };

            req.params = {
                id: "2"
            };

        });

        // Test Case 1: Successfully update cuisine
        it("should update the vendor's cuisine", async () => {

            cuisineModel.updateCuisine.mockResolvedValue(true);

            await cuisineController.updateCuisine(req, res);

            // Verify model function called
            expect(cuisineModel.updateCuisine)
                .toHaveBeenCalledWith(
                    1,
                    2
                );

            // Verify response
            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Cuisine updated successfully."
                });

        });

        // Test Case 2: Cuisine not found
        it("should return 404 when the cuisine is not found", async () => {

            cuisineModel.updateCuisine.mockResolvedValue(false);

            await cuisineController.updateCuisine(req, res);

            // Verify model function called
            expect(cuisineModel.updateCuisine)
                .toHaveBeenCalledWith(
                    1,
                    2
                );

            // Verify status code
            expect(res.status)
                .toHaveBeenCalledWith(404);

            // Verify response
            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Cuisine not found."
                });

        });

        // Test Case 3: Server error
        it("should return 500 when the model throws an error", async () => {

            cuisineModel.updateCuisine.mockRejectedValue(
                new Error("Database Error")
            );

            await cuisineController.updateCuisine(req, res);

            // Verify status code
            expect(res.status)
                .toHaveBeenCalledWith(500);

            // Verify response
            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Unable to update cuisine."
                });

        });

    });

    //
    // ==============================
    // deleteCuisine
    // ==============================
    //

    describe("deleteCuisine", () => {

        beforeEach(() => {

            jest.clearAllMocks();

            req.user = {
                id: 1
            };

            req.params = {
                id: "2"
            };

        });

        // Test Case 1: Successfully delete cuisine
        it("should delete the specified cuisine", async () => {

            cuisineModel.deleteCuisine.mockResolvedValue(true);

            await cuisineController.deleteCuisine(req, res);

            // Verify model function called
            expect(cuisineModel.deleteCuisine)
                .toHaveBeenCalledWith(
                    "2",
                    1
                );

            // Verify response
            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Cuisine deleted successfully."
                });

        });

        // Test Case 2: Cuisine cannot be deleted
        it("should return 400 when the cuisine cannot be deleted", async () => {

            cuisineModel.deleteCuisine.mockResolvedValue(false);

            await cuisineController.deleteCuisine(req, res);

            // Verify model function called
            expect(cuisineModel.deleteCuisine)
                .toHaveBeenCalledWith(
                    "2",
                    1
                );

            // Verify status code
            expect(res.status)
                .toHaveBeenCalledWith(400);

            // Verify response
            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Cuisine cannot be deleted because it is currently assigned to your stall or is not a custom cuisine."
                });

        });

        // Test Case 3: Server error
        it("should return 500 when the model throws an error", async () => {

            cuisineModel.deleteCuisine.mockRejectedValue(
                new Error("Database Error")
            );

            await cuisineController.deleteCuisine(req, res);

            // Verify status code
            expect(res.status)
                .toHaveBeenCalledWith(500);

            // Verify response
            expect(res.json)
                .toHaveBeenCalledWith({
                    message: "Failed to delete cuisine."
                });

        });

    });

});