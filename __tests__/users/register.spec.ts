import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";
import { Roles } from "../../src/constants";
import app from "../../src/app";
import request from "supertest";

describe("POST /auth/register", () => {
    let connection: DataSource;
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // Database truncate
        await connection.dropDatabase();
        await connection.synchronize();
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

        it("should return the id of the newly created user", async () => {
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

            // Assert
            expect(response.body).toHaveProperty("id");
            const repository = connection.getRepository(User);
            const users = await repository.find();
            expect((response.body as Record<string, string>).id).toBe(
                users[0].id,
            );
        });

        it("should assign a customer role only", async () => {
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
            expect(users[0]).toHaveProperty("role");
            expect(users[0].role).toBe(Roles.customer);
        });

        it("should save the hashed password in the database", async () => {
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
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2[a|b]\$\d+\$/);
        });

        it("should return 400 statusCode if the email is not unique", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "johndoe@gmail.com",
                password: "something",
            };

            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Roles.customer });

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            const users = await userRepository.find();

            // Assert
            expect(response.statusCode).toBe(400);
            expect(users.length).toBe(1);
        });
    });

    describe("Fields are missing", () => {
        it("should return 400 statusCode if email field is missing", async () => {
            // Arrange
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "",
                password: "something",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            // Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(0);
        });

        describe("Fields are not in proper format", () => {
            it("should print the email field", async () => {
                // Arrange
                const userData = {
                    firstName: "John",
                    lastName: "Doe",
                    email: " something@gmail.com ",
                    password: "something",
                };

                // Act
                await request(app).post("/auth/register").send(userData);
                const userRepository = connection.getRepository(User);
                const users = await userRepository.find();
                const user = users[0];
                // Assert

                expect(user.email).toBe("something@gmail.com");
            });
        });
    });
});
