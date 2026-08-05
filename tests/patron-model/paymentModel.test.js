const paymentModel =
    require("../../models/paymentModel");


describe("PaymentModel.processPayment", () => {

    afterEach(() => {

        jest.restoreAllMocks();

    });


    // --- Test Case 1: Cash payment ---
    it("should return true for Cash payments", async () => {

        const result =
            await paymentModel.processPayment("Cash");

        expect(result).toBe(true);

    });


    // --- Test Case 2: Mastercard payment ---
    it("should return true for Mastercard payments", async () => {

        const result =
            await paymentModel.processPayment("Mastercard");

        expect(result).toBe(true);

    });


    // --- Test Case 3: Successful Visa payment ---
    it("should return true when Visa payment succeeds", async () => {

        jest.spyOn(Math, "random")

            .mockReturnValue(0.9);

        const result =
            await paymentModel.processPayment("Visa");

        expect(result).toBe(true);

    });


    // --- Test Case 4: Failed Visa payment ---
    it("should return false when Visa payment fails", async () => {

        jest.spyOn(Math, "random")

            .mockReturnValue(0.5);

        const result =
            await paymentModel.processPayment("Visa");

        expect(result).toBe(false);

    });


    // --- Test Case 5: Unsupported payment method ---
    it("should return false for an unsupported payment method", async () => {

        const result =
            await paymentModel.processPayment("PayNow");

        expect(result).toBe(false);

    });

});