import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import bcrypt from "bcryptjs";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}
    register = async (
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) => {
        const { firstName, lastName, email, password } = req.body;

        // Hashing the Password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        this.logger.debug("New request to register a user", {
            firstName,
            lastName,
            email,
            password: "****",
        });
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
            });
            this.logger.info("User registered successfully.", { id: user.id });
            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    };
}
