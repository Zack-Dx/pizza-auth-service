import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import request from "supertest";
import { UserData } from "../../src/types";

let connection: DataSource;

// Helper function to initialize the database
const initializeDatabase = async () => {
    connection = await AppDataSource.initialize();
};

// Helper function to reset the database
const resetDatabase = async () => {
    await connection.dropDatabase();
    await connection.synchronize();
};

// Helper function to destroy the database connection
const destroyDatabase = async () => {
    await connection.destroy();
};

// Helper function to create a user
const createUser = async (userData: UserData) => {
    await request(app).post("/auth/register").send(userData);
};

describe("POST /auth/login", () => {
    beforeAll(async () => {
        await initializeDatabase();
    });

    beforeEach(async () => {
        await resetDatabase();
    });

    afterAll(async () => {
        await destroyDatabase();
    });

    describe("Given all fields", () => {
        it("should return 200 statusCode", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "johndoe@gmail.com",
                password: "something",
            };

            await createUser(userData);

            // Act
            const response = await request(app)
                .post("/auth/login")
                .send(userData);

            // Assert
            const statusCode = response.statusCode;
            expect(statusCode).toBe(200);
        });
    });
});
