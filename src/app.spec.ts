import { calculateDiscount } from "./utils";
import request from "supertest";
import app from "./app";

describe.skip("App", () => {
    it("should calculate the discount", () => {
        const discount = calculateDiscount(100, 10);
        expect(discount).toBe(10);
    });
    it("should return 200 statusCode & hello", async () => {
        const response = await request(app).get("/");
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("Hello");
    });
});
