import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { truncateTables } from "../utils";
import { User } from "../../src/entity/User";
import app from "../../src/app";
import request from "supertest";

describe("POST /auth/register", () => {
    let connection: DataSource;
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // Database truncate
        await truncateTables(connection);
    });

    afterAll(async () => {
        await connection.destroy();
    });

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

            // Assert application/json utf-8
            expect(
                (response.headers as Record<string, string>)["content-type"],
            ).toEqual(expect.stringContaining("json"));
        });

        it("should persist user in the database", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "johndoe@gmail.com",
                password: "something",
            };

            // Act
            await request(app).post("/auth/register").send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
        });
    });
});
