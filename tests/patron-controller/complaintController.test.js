const complaintController =
    require(
        "../../controllers/complaintController"
    );

const complaintModel =
    require(
        "../../models/complaintModel"
    );


// Mock the complaint model
jest.mock(
    "../../models/complaintModel"
);


describe(
    "Complaint Controller",
    () => {

        beforeEach(() => {

            jest.clearAllMocks();

        });


        // Test 1: Retrieve complaint history
        it(
            "should retrieve the patron complaint history",
            async () => {

                const mockComplaints = [

                    {
                        complaint_id: 1,
                        patron_id: 1,
                        stall_id: 5,
                        item_id: 2,
                        food_issue:
                            "Food was cold"
                    }

                ];


                complaintModel
                    .getComplaintsByPatronId
                    .mockResolvedValue(
                        mockComplaints
                    );


                const req = {

                    user: {
                        id: 1,
                        role: "patron"
                    }

                };


                const res = {

                    status: jest.fn()
                        .mockReturnThis(),

                    json: jest.fn()

                };


                await complaintController
                    .getComplaintHistory(
                        req,
                        res
                    );


                expect(
                    complaintModel
                        .getComplaintsByPatronId
                ).toHaveBeenCalledWith(1);


                expect(
                    res.json
                ).toHaveBeenCalledWith(
                    mockComplaints
                );

            }

        );


        // Test 2: Create complaint
        it(
            "should create a complaint and return status 201",
            async () => {

                const newComplaint = {

                    complaint_id: 2,
                    patron_id: 1,
                    stall_id: 5,
                    item_id: 3,
                    food_issue:
                        "Food was undercooked"

                };


                complaintModel
                    .createComplaint
                    .mockResolvedValue(
                        newComplaint
                    );


                const req = {

                    user: {
                        id: 1,
                        role: "patron"
                    },

                    body: {

                        stallId: 5,
                        itemId: 3,

                        purchaseDate:
                            "2026-08-02",

                        foodIssue:
                            "Food was undercooked",

                        serviceIssue:
                            "Service was slow",

                        additionalComments:
                            "Please investigate"

                    }

                };


                const res = {

                    status: jest.fn()
                        .mockReturnThis(),

                    json: jest.fn()

                };


                await complaintController
                    .createComplaint(
                        req,
                        res
                    );


                expect(
                    complaintModel
                        .createComplaint
                ).toHaveBeenCalledWith({

                    orderId: null,
                    patronId: 1,
                    stallId: 5,
                    itemId: 3,

                    purchaseDate:
                        "2026-08-02",

                    foodIssue:
                        "Food was undercooked",

                    serviceIssue:
                        "Service was slow",

                    additionalComments:
                        "Please investigate"

                });


                expect(
                    res.status
                ).toHaveBeenCalledWith(201);


                expect(
                    res.json
                ).toHaveBeenCalledWith({

                    message:
                        "Complaint submitted successfully.",

                    complaint:
                        newComplaint

                });

            }

        );


        // Test 3: Complaint not found during update
        it(
            "should return status 404 when complaint cannot be updated",
            async () => {

                complaintModel
                    .updateComplaint
                    .mockResolvedValue(null);


                const req = {

                    user: {
                        id: 1,
                        role: "patron"
                    },

                    params: {
                        complaintId: "99"
                    },

                    body: {

                        stallId: 5,
                        itemId: 3,

                        purchaseDate:
                            "2026-08-02",

                        foodIssue:
                            "Updated issue",

                        serviceIssue:
                            "Updated service issue",

                        additionalComments:
                            "Updated comments"

                    }

                };


                const res = {

                    status: jest.fn()
                        .mockReturnThis(),

                    json: jest.fn()

                };


                await complaintController
                    .updateComplaint(
                        req,
                        res
                    );


                expect(
                    complaintModel
                        .updateComplaint
                ).toHaveBeenCalledWith(

                    99,
                    1,
                    {

                        stallId: 5,
                        itemId: 3,

                        purchaseDate:
                            "2026-08-02",

                        foodIssue:
                            "Updated issue",

                        serviceIssue:
                            "Updated service issue",

                        additionalComments:
                            "Updated comments"

                    }

                );


                expect(
                    res.status
                ).toHaveBeenCalledWith(404);


                expect(
                    res.json
                ).toHaveBeenCalledWith({

                    message:
                        "Complaint not found."

                });

            }

        );


        // Test 4: Delete complaint
        it(
            "should delete a complaint successfully",
            async () => {

                complaintModel
                    .deleteComplaint
                    .mockResolvedValue({

                        complaint_id: 3

                    });


                const req = {

                    user: {
                        id: 1,
                        role: "patron"
                    },

                    params: {
                        complaintId: "3"
                    }

                };


                const res = {

                    status: jest.fn()
                        .mockReturnThis(),

                    json: jest.fn()

                };


                await complaintController
                    .deleteComplaint(
                        req,
                        res
                    );


                expect(
                    complaintModel
                        .deleteComplaint
                ).toHaveBeenCalledWith(
                    3,
                    1
                );


                expect(
                    res.json
                ).toHaveBeenCalledWith({

                    message:
                        "Complaint deleted successfully."

                });

            }

        );

    }
);