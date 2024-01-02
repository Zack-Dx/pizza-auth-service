import app from "../../src/app";
import request from "supertest";

describe("POST /auth/register", () => {
    describe("Provided All Required Fields", () => {
        it("should return 201 statusCode", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "johndoe@gmail.com",
                password: "something",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Asssert
            const statusCode = response.statusCode;
            expect(statusCode).toBe(201);
        });

        it("should return Content-Type header as application/json", async () => {
            const response = await request(app).post("/auth/register");
            expect(response.headers["content-type"]).toMatch(
                /^application\/json/,
            );
        });
    });

    describe("Missing Required Fields", () => {});
});
