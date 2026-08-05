const feedbackModel =
    require(
        "../../models/feedbacksModel"
    );

const sql =
    require("mssql");


// Mock the MSSQL library
jest.mock("mssql");


describe(
    "feedbackModel.getFeedbacksByPatron",
    () => {

        let mockRequest;
        let mockConnection;


        beforeEach(() => {

            jest.clearAllMocks();


            mockRequest = {

                input: jest.fn()
                    .mockReturnThis(),

                query: jest.fn()

            };


            mockConnection = {

                request: jest.fn()
                    .mockReturnValue(
                        mockRequest
                    ),

                close: jest.fn()
                    .mockResolvedValue(
                        undefined
                    )

            };


            sql.connect.mockResolvedValue(
                mockConnection
            );

        });


        // Test 1: Successfully retrieve feedback
        it(
            "should retrieve feedback from the database",
            async () => {

                const mockFeedbacks = [

                    {
                        feedback_id: 1,
                        patron_id: 1,
                        stall_id: 5,
                        food_rating: 4,
                        service_rating: 5,
                        atmosphere_rating: 4,
                        feedback_description:
                            "Good food"
                    }

                ];


                mockRequest.query
                    .mockResolvedValue({

                        recordset:
                            mockFeedbacks

                    });


                const result =
                    await feedbackModel
                        .getFeedbacksByPatron(1);


                expect(
                    sql.connect
                ).toHaveBeenCalledWith(
                    expect.any(Object)
                );


                expect(
                    mockConnection.request
                ).toHaveBeenCalledTimes(1);


                expect(
                    mockRequest.input
                ).toHaveBeenCalledWith(

                    "patronId",
                    sql.Int,
                    1

                );


                expect(
                    mockRequest.query
                ).toHaveBeenCalledTimes(1);


                expect(result).toEqual(
                    mockFeedbacks
                );

            }

        );


        // Test 2: No feedback found
        it(
            "should return an empty array when no feedback exists",
            async () => {

                mockRequest.query
                    .mockResolvedValue({

                        recordset: []

                    });


                const result =
                    await feedbackModel
                        .getFeedbacksByPatron(1);


                expect(result).toEqual([]);


                expect(
                    mockRequest.input
                ).toHaveBeenCalledWith(

                    "patronId",
                    sql.Int,
                    1

                );

            }

        );


        // Test 3: Database connection failure
        it(
            "should throw an error when database connection fails",
            async () => {

                sql.connect.mockRejectedValue(
                    new Error(
                        "Database connection failed"
                    )
                );


                await expect(

                    feedbackModel
                        .getFeedbacksByPatron(1)

                ).rejects.toThrow(
                    "Database connection failed"
                );

            }

        );

    }
);