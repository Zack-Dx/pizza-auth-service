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

    const validUserData: UserData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        password: "something",
    };

    describe("Given all fields correctly", () => {
        it("should return 200 statusCode with correct credentials", async () => {
            await createUser(validUserData);

            const response = await request(app).post("/auth/login").send({
                email: validUserData.email,
                password: validUserData.password,
            });

            expect(response.statusCode).toBe(200);
        });

        it("should return 401 statusCode with incorrect password", async () => {
            await createUser(validUserData);

            const response = await request(app).post("/auth/login").send({
                email: validUserData.email,
                password: "wrongpassword",
            });

            expect(response.statusCode).toBe(401);
        });

        it("should return 404 statusCode for non-existent user", async () => {
            const nonExistentUserData = {
                email: "nonexistent@gmail.com",
                password: "dummy",
            };

            const response = await request(app)
                .post("/auth/login")
                .send(nonExistentUserData);

            expect(response.statusCode).toBe(404);
        });

        it("should return 400 statusCode for SQL injection attempt", async () => {
            const response = await request(app).post("/auth/login").send({
                email: "john@example.com'; DROP TABLE users; --",
                password: validUserData.password,
            });

            expect(response.statusCode).toBe(400);
        });
    });

    describe("Given missing or invalid fields", () => {
        it("should return 400 statusCode for invalid email format", async () => {
            const response = await request(app).post("/auth/login").send({
                email: "invalid-email",
                password: validUserData.password,
            });

            expect(response.statusCode).toBe(400);
        });

        it("should return 400 statusCode for missing email", async () => {
            const response = await request(app).post("/auth/login").send({
                password: validUserData.password,
            });

            expect(response.statusCode).toBe(400);
        });

        it("should return 400 statusCode for missing password", async () => {
            const response = await request(app).post("/auth/login").send({
                email: validUserData.email,
            });

            expect(response.statusCode).toBe(400);
        });

        it("should return 400 statusCode for empty email", async () => {
            const response = await request(app).post("/auth/login").send({
                email: "",
                password: validUserData.password,
            });

            expect(response.statusCode).toBe(400);
        });

        it("should return 400 statusCode for empty password", async () => {
            const response = await request(app).post("/auth/login").send({
                email: validUserData.email,
                password: "",
            });

            expect(response.statusCode).toBe(400);
        });
    });
});
