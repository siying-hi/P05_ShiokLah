const feedbackController =
    require(
        "../../controllers/feedbacksController"
    );

const feedbackModel =
    require(
        "../../models/feedbacksModel"
    );


// Mock the feedback model
jest.mock(
    "../../models/feedbacksModel"
);


describe(
    "feedbackController.getFeedbacksByPatron",
    () => {

        beforeEach(() => {

            jest.clearAllMocks();

        });


        // Test 1: Successful request
        it(
            "should retrieve feedback and return status 200",
            async () => {

                const mockFeedbacks = [

                    {
                        feedback_id: 1,
                        patron_id: 1,
                        stall_id: 5,
                        food_rating: 4
                    }

                ];


                feedbackModel
                    .getFeedbacksByPatron
                    .mockResolvedValue(
                        mockFeedbacks
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


                await feedbackController
                    .getFeedbacksByPatron(
                        req,
                        res
                    );


                expect(
                    feedbackModel
                        .getFeedbacksByPatron
                ).toHaveBeenCalledWith(1);


                expect(
                    res.status
                ).toHaveBeenCalledWith(200);


                expect(
                    res.json
                ).toHaveBeenCalledWith(
                    mockFeedbacks
                );

            }

        );


        // Test 2: User is not logged in
        it(
            "should return status 401 when user is not logged in",
            async () => {

                const req = {};


                const res = {

                    status: jest.fn()
                        .mockReturnThis(),

                    json: jest.fn()

                };


                await feedbackController
                    .getFeedbacksByPatron(
                        req,
                        res
                    );


                expect(
                    res.status
                ).toHaveBeenCalledWith(401);


                expect(
                    res.json
                ).toHaveBeenCalledWith({

                    message:
                        "You must be logged in."

                });


                expect(
                    feedbackModel
                        .getFeedbacksByPatron
                ).not.toHaveBeenCalled();

            }

        );


        // Test 3: Database error
        it(
            "should return status 500 when database fails",
            async () => {

                feedbackModel
                    .getFeedbacksByPatron
                    .mockRejectedValue(
                        new Error(
                            "Database error"
                        )
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


                await feedbackController
                    .getFeedbacksByPatron(
                        req,
                        res
                    );


                expect(
                    res.status
                ).toHaveBeenCalledWith(500);


                expect(
                    res.json
                ).toHaveBeenCalledWith({

                    message:
                        "Unable to retrieve feedback."

                });

            }

        );

    }
);