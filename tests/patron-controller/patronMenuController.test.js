jest.mock("../../models/patronMenuModel", () => ({

    getStall: jest.fn(),
    getMenuItems: jest.fn()

}));

jest.mock("../../models/seedUserFallback", () => ({

    getRows: jest.fn()

}));

jest.mock("../../models/seedHygieneFallback", () => ({

    getAllWithLatestGrade: jest.fn()

}));


const patronMenuModel =
    require("../../models/patronMenuModel");

const seedUserFallback =
    require("../../models/seedUserFallback");

const seedHygieneFallback =
    require("../../models/seedHygieneFallback");

const patronMenuController =
    require("../../controllers/patronMenuController");


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


// Patron menu controller tests
describe("PatronMenuController.getStallMenu", () => {

    let req;
    let res;

    beforeEach(() => {

        jest.clearAllMocks();

        jest.spyOn(console, "error")
            .mockImplementation(() => {});

        req = {

            params: {

                stallId: "1"

            }

        };

        res = createMockResponse();

    });

    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Successful stall menu retrieval ---
    it("should return the stall and its menu items", async () => {

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

        patronMenuModel.getStall
            .mockResolvedValue(stall);

        patronMenuModel.getMenuItems
            .mockResolvedValue(menuItems);

        await patronMenuController.getStallMenu(
            req,
            res
        );

        expect(patronMenuModel.getStall)
            .toHaveBeenCalledWith("1");

        expect(patronMenuModel.getMenuItems)
            .toHaveBeenCalledWith("1");

        expect(res.json)
            .toHaveBeenCalledWith({

                stall,
                menuItems

            });

    });


    // --- Test Case 2: Stall not found ---
    it("should return 404 if the stall does not exist", async () => {

        patronMenuModel.getStall
            .mockResolvedValue(null);

        await patronMenuController.getStallMenu(
            req,
            res
        );

        expect(res.status)
            .toHaveBeenCalledWith(404);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Stall not found."

            });

        expect(patronMenuModel.getMenuItems)
            .not.toHaveBeenCalled();

    });


    // --- Test Case 3: Database unavailable with seeded fallback ---
    it("should return seeded stall and menu data when database is unavailable", async () => {

        const databaseError =
            new Error("Database unavailable");

        databaseError.code = "ESOCKET";

        patronMenuModel.getStall
            .mockRejectedValue(databaseError);

        seedHygieneFallback.getAllWithLatestGrade
            .mockReturnValue([

                {
                    stall_id: 1,
                    stall_name: "Ah Tan Chicken Rice",
                    image_name: "chicken-rice.jpg",
                    rating: 4.5,
                    cuisine_type: "Chinese",
                    hygiene_grade: "A",
                    score: 95,
                    inspection_date: "2026-07-20"
                }

            ]);

        seedUserFallback.getRows
            .mockReturnValue([

                {
                    item_id: "1",
                    item_name: "Chicken Rice",
                    price: "5.50",
                    food_description: "Roasted chicken rice",
                    allergen_info: "Soy",
                    estimated_waiting_time: "10",
                    image_name: "chicken-rice.jpg",
                    visibility: "1",
                    stall_id: "1"
                },

                {
                    item_id: "2",
                    item_name: "Hidden Item",
                    price: "4.00",
                    food_description: "Not visible",
                    allergen_info: "",
                    estimated_waiting_time: "5",
                    image_name: "hidden.jpg",
                    visibility: "0",
                    stall_id: "1"
                },

                {
                    item_id: "3",
                    item_name: "Other Stall Item",
                    price: "6.00",
                    food_description: "Different stall",
                    allergen_info: "",
                    estimated_waiting_time: "8",
                    image_name: "other.jpg",
                    visibility: "1",
                    stall_id: "2"
                }

            ]);

        await patronMenuController.getStallMenu(
            req,
            res
        );

        expect(seedHygieneFallback.getAllWithLatestGrade)
            .toHaveBeenCalledTimes(1);

        expect(seedUserFallback.getRows)
            .toHaveBeenCalledWith("MenuItem");

        expect(res.json)
            .toHaveBeenCalledWith({

                stall: {

                    stall_id: 1,
                    stall_name: "Ah Tan Chicken Rice",
                    image_name: "chicken-rice.jpg",
                    rating: 4.5,
                    cuisine_type: "Chinese",
                    hygiene_grade: "A",
                    hygiene_score: 95,
                    hygiene_inspection_date: "2026-07-20"

                },

                menuItems: [

                    {
                        item_id: 1,
                        item_name: "Chicken Rice",
                        price: 5.5,
                        food_description: "Roasted chicken rice",
                        allergen_info: "Soy",
                        estimated_waiting_time: 10,
                        image_name: "chicken-rice.jpg",
                        visibility: 1,
                        stall_id: 1
                    }

                ]

            });

    });


    // --- Test Case 4: Seeded stall uses default image and null hygiene values ---
    it("should use fallback values for missing seeded stall details", async () => {

        const databaseError =
            new Error("Database unavailable");

        databaseError.code = "ETIMEOUT";

        patronMenuModel.getStall
            .mockRejectedValue(databaseError);

        seedHygieneFallback.getAllWithLatestGrade
            .mockReturnValue([

                {
                    stall_id: 1,
                    stall_name: "Test Stall",
                    image_name: "",
                    rating: 4,
                    cuisine_type: "Asian",
                    hygiene_grade: "",
                    score: undefined,
                    inspection_date: ""
                }

            ]);

        seedUserFallback.getRows
            .mockReturnValue([]);

        await patronMenuController.getStallMenu(
            req,
            res
        );

        expect(res.json)
            .toHaveBeenCalledWith({

                stall: {

                    stall_id: 1,
                    stall_name: "Test Stall",
                    image_name: "default-stall.jpg",
                    rating: 4,
                    cuisine_type: "Asian",
                    hygiene_grade: null,
                    hygiene_score: null,
                    hygiene_inspection_date: null

                },

                menuItems: []

            });

    });


    // --- Test Case 5: Blank visibility defaults to visible ---
    it("should treat blank seeded visibility as visible", async () => {

        const databaseError =
            new Error("Database unavailable");

        databaseError.code = "ELOGIN";

        patronMenuModel.getStall
            .mockRejectedValue(databaseError);

        seedHygieneFallback.getAllWithLatestGrade
            .mockReturnValue([

                {
                    stall_id: 1,
                    stall_name: "Test Stall",
                    image_name: "stall.jpg",
                    rating: 4,
                    cuisine_type: "Asian",
                    hygiene_grade: "A",
                    score: 90,
                    inspection_date: "2026-07-20"
                }

            ]);

        seedUserFallback.getRows
            .mockReturnValue([

                {
                    item_id: "",
                    item_name: "Fallback Item",
                    price: "3.50",
                    food_description: "Test item",
                    allergen_info: "",
                    estimated_waiting_time: "5",
                    image_name: "item.jpg",
                    visibility: "",
                    stall_id: "1"
                }

            ]);

        await patronMenuController.getStallMenu(
            req,
            res
        );

        expect(res.json)
            .toHaveBeenCalledWith({

                stall: {

                    stall_id: 1,
                    stall_name: "Test Stall",
                    image_name: "stall.jpg",
                    rating: 4,
                    cuisine_type: "Asian",
                    hygiene_grade: "A",
                    hygiene_score: 90,
                    hygiene_inspection_date: "2026-07-20"

                },

                menuItems: [

                    {
                        item_id: 1,
                        item_name: "Fallback Item",
                        price: 3.5,
                        food_description: "Test item",
                        allergen_info: "",
                        estimated_waiting_time: 5,
                        image_name: "item.jpg",
                        visibility: 1,
                        stall_id: 1
                    }

                ]

            });

    });


    // --- Test Case 6: Seeded stall not found ---
    it("should return 404 if fallback stall is not found", async () => {

        const databaseError =
            new Error("Database unavailable");

        databaseError.code = "ESOCKET";

        patronMenuModel.getStall
            .mockRejectedValue(databaseError);

        seedHygieneFallback.getAllWithLatestGrade
            .mockReturnValue([]);

        await patronMenuController.getStallMenu(
            req,
            res
        );

        expect(seedUserFallback.getRows)
            .not.toHaveBeenCalled();

        expect(res.status)
            .toHaveBeenCalledWith(404);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Stall not found."

            });

    });


    // --- Test Case 7: Unexpected database error ---
    it("should return 500 for an unexpected error", async () => {

        patronMenuModel.getStall
            .mockRejectedValue(

                new Error("Unexpected error")

            );

        await patronMenuController.getStallMenu(
            req,
            res
        );

        expect(seedHygieneFallback.getAllWithLatestGrade)
            .not.toHaveBeenCalled();

        expect(seedUserFallback.getRows)
            .not.toHaveBeenCalled();

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Internal server error."

            });

    });


    // --- Test Case 8: Menu item retrieval error ---
    it("should return 500 if loading menu items fails", async () => {

        patronMenuModel.getStall
            .mockResolvedValue({

                stall_id: 1,
                stall_name: "Ah Tan Chicken Rice"

            });

        patronMenuModel.getMenuItems
            .mockRejectedValue(

                new Error("Menu query failed")

            );

        await patronMenuController.getStallMenu(
            req,
            res
        );

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Internal server error."

            });

    });

});