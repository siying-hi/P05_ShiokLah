jest.mock("../../models/patronProfileModel", () => ({

    getPatronProfile: jest.fn(),
    updatePatronProfile: jest.fn(),
    deletePatronAccount: jest.fn()

}));

const patronProfileModel =
    require("../../models/patronProfileModel");

const patronProfileController =
    require("../../controllers/patronProfileController");


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


// Get patron profile tests
describe("PatronProfileController.getPatronProfile", () => {

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


    // --- Test Case 1: Patron profile found ---
    it("should return the patron profile", async () => {

        const patron = {

            patron_id: 1,
            username: "alice",
            email: "alice@email.com",
            first_name: "Alice",
            last_name: "Tan"

        };

        patronProfileModel.getPatronProfile
            .mockResolvedValue(patron);

        await patronProfileController
            .getPatronProfile(req, res);

        expect(patronProfileModel.getPatronProfile)
            .toHaveBeenCalledWith(1);

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith(patron);

    });


    // --- Test Case 2: Patron profile not found ---
    it("should return 404 if patron is not found", async () => {

        patronProfileModel.getPatronProfile
            .mockResolvedValue(undefined);

        await patronProfileController
            .getPatronProfile(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(404);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Patron not found."

            });

    });


    // --- Test Case 3: Model error ---
    it("should return 500 if loading the profile fails", async () => {

        patronProfileModel.getPatronProfile
            .mockRejectedValue(

                new Error("Database error")

            );

        await patronProfileController
            .getPatronProfile(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Internal server error."

            });

    });

});


// Update patron profile tests
describe("PatronProfileController.updatePatronProfile", () => {

    let req;
    let res;

    beforeEach(() => {

        jest.clearAllMocks();

        jest.spyOn(console, "error")
            .mockImplementation(() => {});

        req = {

            user: {

                id: 1

            },

            body: {

                username: "alice",
                firstName: "Alice",
                lastName: "Tan",
                email: "alice@email.com"

            }

        };

        res = createMockResponse();

    });

    afterEach(() => {

        console.error.mockRestore();

    });


    // --- Test Case 1: Successful profile update ---
    it("should update the patron profile successfully", async () => {

        patronProfileModel.updatePatronProfile
            .mockResolvedValue();

        await patronProfileController
            .updatePatronProfile(req, res);

        expect(patronProfileModel.updatePatronProfile)
            .toHaveBeenCalledWith(

                1,
                "alice",
                "Alice",
                "Tan",
                "alice@email.com"

            );

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Profile updated successfully."

            });

    });


    // --- Test Case 2: Model error ---
    it("should return 500 if updating the profile fails", async () => {

        patronProfileModel.updatePatronProfile
            .mockRejectedValue(

                new Error("Database error")

            );

        await patronProfileController
            .updatePatronProfile(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Internal server error."

            });

    });

});


// Delete patron account tests
describe("PatronProfileController.deletePatronAccount", () => {

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


    // --- Test Case 1: Successful account deletion ---
    it("should delete the patron account successfully", async () => {

        patronProfileModel.deletePatronAccount
            .mockResolvedValue();

        await patronProfileController
            .deletePatronAccount(req, res);

        expect(patronProfileModel.deletePatronAccount)
            .toHaveBeenCalledWith(1);

        expect(res.status)
            .toHaveBeenCalledWith(200);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Account deleted successfully."

            });

    });


    // --- Test Case 2: Model error ---
    it("should return 500 if deleting the account fails", async () => {

        patronProfileModel.deletePatronAccount
            .mockRejectedValue(

                new Error("Database error")

            );

        await patronProfileController
            .deletePatronAccount(req, res);

        expect(res.status)
            .toHaveBeenCalledWith(500);

        expect(res.json)
            .toHaveBeenCalledWith({

                message: "Internal server error."

            });

    });

});