import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import { RefreshToken } from "../../src/entity/RefreshToken";
import { isJWT } from "../utils";
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

// Helper function to send the user data
const postUserData = async (userData: UserData) => {
    return await request(app).post("/auth/register").send(userData);
};

describe("POST /auth/register", () => {
    beforeAll(async () => {
        await initializeDatabase();
    });

    beforeEach(async () => {
        await resetDatabase();
    });

    afterAll(async () => {
        await destroyDatabase();
    });

    const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@gmail.com",
        password: "something",
    };

    describe("Provided All Required Fields", () => {
        it("should return 201 statusCode", async () => {
            const { statusCode } = await postUserData(userData);
            expect(statusCode).toBe(201);
        });

        it("should return Content-Type header as application/json", async () => {
            const response = await postUserData(userData);
            expect(
                (response.headers as Record<string, string>)["content-type"],
            ).toEqual(expect.stringContaining("json"));
        });

        it("should add user in the database", async () => {
            await postUserData(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
        });

        it("should return the id of the newly created user", async () => {
            const response = await postUserData(userData);
            expect(response.body).toHaveProperty("id");
            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect((response.body as Record<string, string>).id).toBe(
                users[0].id,
            );
        });

        it("should assign a customer role only", async () => {
            await postUserData(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty("role");
            expect(users[0].role).toBe(Roles.customer);
        });

        it("should save the hashed password in the database", async () => {
            await postUserData(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2[a|b]\$\d+\$/);
        });

        it("should return 400 statusCode if the email is not unique", async () => {
            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Roles.customer });
            const response = await postUserData(userData);
            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users.length).toBe(1);
        });

        it("should return an access token and a refresh token inside a cookie", async () => {
            interface Headers {
                [key: string]: string[];
            }
            const response = await postUserData(userData);
            const cookies =
                (response.headers as unknown as Headers)["set-cookie"] || [];

            let accessToken: string | null = null;
            let refreshToken: string | null = null;

            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken=")) {
                    accessToken = cookie.split(";")[0].split("=")[1];
                }

                if (cookie.startsWith("refreshToken=")) {
                    refreshToken = cookie.split(";")[0].split("=")[1];
                }
            });
            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect(isJWT(accessToken)).toBeTruthy();
            expect(isJWT(refreshToken)).toBeTruthy();
        });

        it("should store the refresh token in the database", async () => {
            const response = await postUserData(userData);
            const refreshTokenRepo = connection.getRepository(RefreshToken);
            const refreshTokens = await refreshTokenRepo.find();
            expect(refreshTokens).toHaveLength(1);
            const tokens = await refreshTokenRepo
                .createQueryBuilder("refreshToken")
                .where("refreshToken.userId = :userId", {
                    userId: (response.body as Record<string, string>).id,
                })
                .getMany();

            expect(tokens).toHaveLength(1);
        });
    });

    describe("Fields are missing", () => {
        it("should return 400 statusCode if email field is missing", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "",
                password: "something",
            };
            const response = await postUserData(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            // Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it("should return 400 statusCode if firstName is missing", async () => {
            const userData = {
                firstName: "",
                lastName: "Doe",
                email: "something@gmail.com",
                password: "something",
            };

            const response = await postUserData(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            // Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it("should return 400 statusCode if lastName is missing", async () => {
            const userData = {
                firstName: "John",
                lastName: "",
                email: "something@gmail.com",
                password: "something",
            };
            const response = await postUserData(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it("should return 400 statusCode if password is missing", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "something@gmail.com",
                password: "",
            };

            const response = await postUserData(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            // Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
    });

    describe("Fields are not in proper format", () => {
        it("should trim the email field", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: " something@gmail.com ",
                password: "something",
            };

            await postUserData(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const user = users[0];
            expect(user.email).toBe("something@gmail.com");
        });

        it("should return 400 statusCode if email is not valid email", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "xyz.com",
                password: "something",
            };
            const response = await postUserData(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        it("should return 400 statusCode if password length is less than 8 chars", async () => {
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "something@gmail.com",
                password: "some",
            };
            const response = await postUserData(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });
    });
});
