const complaintModel =
    require(
        "../../models/complaintModel"
    );

const sql =
    require("mssql");


// Mock MSSQL
jest.mock("mssql");


describe(
    "Complaint Model",
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


        // Test 1: Retrieve complaints
        it(
            "should retrieve complaints belonging to the patron",
            async () => {

                const mockComplaints = [

                    {
                        complaint_id: 1,
                        patron_id: 1,
                        stall_id: 5,
                        item_id: 2
                    }

                ];


                mockRequest.query
                    .mockResolvedValue({

                        recordset:
                            mockComplaints

                    });


                const result =
                    await complaintModel
                        .getComplaintsByPatronId(1);


                expect(
                    sql.connect
                ).toHaveBeenCalledWith(
                    expect.any(Object)
                );


                expect(
                    mockRequest.input
                ).toHaveBeenCalledWith(

                    "patronId",
                    sql.Int,
                    1

                );


                expect(result).toEqual(
                    mockComplaints
                );

            }

        );


        // Test 2: Create complaint
        it(
            "should create and return a new complaint",
            async () => {

                const complaint = {

                    orderId: null,
                    patronId: 1,
                    stallId: 5,
                    itemId: 3,

                    purchaseDate:
                        "2026-08-02",

                    foodIssue:
                        "Food was cold",

                    serviceIssue:
                        "Service was slow",

                    additionalComments:
                        "Please investigate"

                };


                const createdComplaint = {

                    complaint_id: 10,
                    patron_id: 1,
                    stall_id: 5,
                    item_id: 3

                };


                mockRequest.query
                    .mockResolvedValue({

                        recordset: [
                            createdComplaint
                        ]

                    });


                const result =
                    await complaintModel
                        .createComplaint(
                            complaint
                        );


                expect(
                    mockRequest.input
                ).toHaveBeenCalledWith(

                    "patronId",
                    sql.Int,
                    1

                );


                expect(
                    mockRequest.input
                ).toHaveBeenCalledWith(

                    "stallId",
                    sql.Int,
                    5

                );


                expect(
                    mockRequest.input
                ).toHaveBeenCalledWith(

                    "itemId",
                    sql.Int,
                    3

                );


                expect(result).toEqual(
                    createdComplaint
                );

            }

        );


        // Test 3: Update complaint not found
        it(
            "should return null when complaint cannot be updated",
            async () => {

                mockRequest.query
                    .mockResolvedValue({

                        recordset: []

                    });


                const complaint = {

                    stallId: 5,
                    itemId: 3,

                    purchaseDate:
                        "2026-08-02",

                    foodIssue:
                        "Updated issue",

                    serviceIssue:
                        "Updated service",

                    additionalComments:
                        "Updated comments"

                };


                const result =
                    await complaintModel
                        .updateComplaint(

                            99,
                            1,
                            complaint

                        );


                expect(
                    mockRequest.input
                ).toHaveBeenCalledWith(

                    "complaintId",
                    sql.Int,
                    99

                );


                expect(result).toBeNull();

            }

        );


        // Test 4: Delete complaint
        it(
            "should delete and return the complaint ID",
            async () => {

                const deletedComplaint = {

                    complaint_id: 3

                };


                mockRequest.query
                    .mockResolvedValue({

                        recordset: [
                            deletedComplaint
                        ]

                    });


                const result =
                    await complaintModel
                        .deleteComplaint(
                            3,
                            1
                        );


                expect(
                    mockRequest.input
                ).toHaveBeenCalledWith(

                    "complaintId",
                    sql.Int,
                    3

                );


                expect(
                    mockRequest.input
                ).toHaveBeenCalledWith(

                    "patronId",
                    sql.Int,
                    1

                );


                expect(result).toEqual(
                    deletedComplaint
                );

            }

        );


        // Test 5: Database connection failure
        it(
            "should throw an error when database connection fails",
            async () => {

                sql.connect.mockRejectedValue(
                    new Error(
                        "Database connection failed"
                    )
                );


                await expect(

                    complaintModel
                        .getComplaintsByPatronId(1)

                ).rejects.toThrow(
                    "Database connection failed"
                );

            }

        );

    }
);