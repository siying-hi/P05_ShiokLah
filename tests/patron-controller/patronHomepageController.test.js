jest.mock("../../models/patronHomepageModel", () => ({

    getPatron: jest.fn(),
    getStalls: jest.fn()

}));

jest.mock("../../models/seedUserFallback", () => ({

    findById: jest.fn()

}));

jest.mock("../../models/seedHygieneFallback", () => ({

    getAllWithLatestGrade: jest.fn()

}));


const patronHomepageModel =
    require("../../models/patronHomepageModel");

const seedUserFallback =
    require("../../models/seedUserFallback");

const seedHygieneFallback =
    require("../../models/seedHygieneFallback");

const patronHomepageController =
    require("../../controllers/patronHomepageController");


// Create mock response object
function createMockResponse() {

    const res = {

        status: jest.fn(),
        json: jest.fn()

    };

    res.status.mockReturnValue(res);
    res.json.mockReturnValue(res);

    return res;

}


// Patron homepage controller tests
describe("PatronHomepageController.getPatronHomepage", () => {

    let req;
    let res;

    beforeEach(() => {

        jest.clearAllMocks();

        jest.spyOn(console, "error")
            .mockImplementation(() => {});

        req = {

            user: {

                id: 1

            }

        };

        res = createMockResponse();

    });

    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Successful homepage retrieval ---
    it("should return patron details and stalls", async () => {

        const patron = {

            first_name: "Alice"

        };

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

        patronHomepageModel.getPatron
            .mockResolvedValue(patron);

        patronHomepageModel.getStalls
            .mockResolvedValue(stalls);

        await patronHomepageController
            .getPatronHomepage(req, res);

        expect(patronHomepageModel.getPatron)
            .toHaveBeenCalledWith(1);

        expect(patronHomepageModel.getStalls)
            .toHaveBeenCalledTimes(1);

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({

                patron,
                stalls

            });

    });


    // --- Test Case 2: Database unavailable with seeded fallback ---
    it("should return seeded patron and stall data when database is unavailable", async () => {

        const databaseError =
            new Error("Database unavailable");

        databaseError.code = "ESOCKET";

        patronHomepageModel.getPatron
            .mockRejectedValue(databaseError);

        seedUserFallback.findById
            .mockReturnValue({

                patron_id: 1,
                first_name: "Alice",
                username: "alice"

            });

        seedHygieneFallback.getAllWithLatestGrade
            .mockReturnValue([

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
                    hygiene_grade: undefined
                }

            ]);

        await patronHomepageController
            .getPatronHomepage(req, res);

        expect(seedUserFallback.findById)
            .toHaveBeenCalledWith(
                "patron",
                1
            );

        expect(seedHygieneFallback.getAllWithLatestGrade)
            .toHaveBeenCalledTimes(1);

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({

                patron: {

                    first_name: "Alice"

                },

                stalls: [

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
                        hygiene_grade: null
                    }

                ]

            });

    });


    // --- Test Case 3: Seeded patron uses username as fallback name ---
    it("should use username if seeded patron has no first name", async () => {

        const databaseError =
            new Error("Database unavailable");

        databaseError.code = "ETIMEOUT";

        patronHomepageModel.getPatron
            .mockRejectedValue(databaseError);

        seedUserFallback.findById
            .mockReturnValue({

                patron_id: 1,
                username: "alice"

            });

        seedHygieneFallback.getAllWithLatestGrade
            .mockReturnValue([]);

        await patronHomepageController
            .getPatronHomepage(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({

                patron: {

                    first_name: "alice"

                },

                stalls: []

            });

    });


    // --- Test Case 4: Seeded patron uses Guest as fallback name ---
    it("should use Guest if seeded patron has no first name or username", async () => {

        const databaseError =
            new Error("Database unavailable");

        databaseError.code = "ELOGIN";

        patronHomepageModel.getPatron
            .mockRejectedValue(databaseError);

        seedUserFallback.findById
            .mockReturnValue({

                patron_id: 1

            });

        seedHygieneFallback.getAllWithLatestGrade
            .mockReturnValue([]);

        await patronHomepageController
            .getPatronHomepage(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({

                patron: {

                    first_name: "Guest"

                },

                stalls: []

            });

    });


    // --- Test Case 5: Seeded patron not found ---
    it("should return 404 if fallback patron is not found", async () => {

        const databaseError =
            new Error("Database unavailable");

        databaseError.code = "ESOCKET";

        patronHomepageModel.getPatron
            .mockRejectedValue(databaseError);

        seedUserFallback.findById
            .mockReturnValue(null);

        await patronHomepageController
            .getPatronHomepage(req, res);

        expect(seedUserFallback.findById)
            .toHaveBeenCalledWith(
                "patron",
                1
            );

        expect(seedHygieneFallback.getAllWithLatestGrade)
            .not.toHaveBeenCalled();

        expect(res.status)
            .toHaveBeenCalledWith(404);

        expect(res.json)
            .toHaveBeenCalledWith({

                message:
                    "Patron account was not found."

            });

    });


    // --- Test Case 6: Unexpected model error ---
    it("should return 500 for an unexpected error", async () => {

        patronHomepageModel.getPatron
            .mockRejectedValue(

                new Error("Unexpected error")

            );

        await patronHomepageController
            .getPatronHomepage(req, res);

        expect(seedUserFallback.findById)
            .not.toHaveBeenCalled();

        expect(seedHygieneFallback.getAllWithLatestGrade)
            .not.toHaveBeenCalled();

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Internal server error."

            });

    });


    // --- Test Case 7: Stall retrieval error ---
    it("should return 500 if loading stalls fails", async () => {

        patronHomepageModel.getPatron
            .mockResolvedValue({

                first_name: "Alice"

            });

        patronHomepageModel.getStalls
            .mockRejectedValue(

                new Error("Stall query failed")

            );

        await patronHomepageController
            .getPatronHomepage(req, res);

        expect(patronHomepageModel.getPatron)
            .toHaveBeenCalledWith(1);

        expect(patronHomepageModel.getStalls)
            .toHaveBeenCalledTimes(1);

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Internal server error."

            });

    });

});