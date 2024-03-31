import fs from "node:fs/promises";
import path from "node:path";
import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { Config } from "../config";
import { JwtPayload, sign } from "jsonwebtoken";
import createHttpError from "http-errors";

const { DOMAIN } = Config;

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
        // Validating Request
        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).json({ errors: result.array() });
            return;
        }

        const { firstName, lastName, email, password } = req.body;

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
                password,
            });
            this.logger.info("User registered successfully.", { id: user.id });

            // Signing Auth Tokens
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            let privateKey: Buffer;

            try {
                privateKey = await fs.readFile(
                    path.join(__dirname, "../../certs/private.pem"),
                );
            } catch (err) {
                const error = createHttpError(
                    500,
                    "Error while reading private key.",
                );
                next(error);
                return;
            }

            const accessToken = sign(payload, privateKey, {
                algorithm: "RS256",
                expiresIn: "1h",
                issuer: "auth-service",
            });

            const refreshToken = "";

            res.cookie("accessToken", accessToken, {
                domain: DOMAIN,
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1h
                httpOnly: true,
            });

            res.cookie("refreshToken", refreshToken, {
                domain: DOMAIN,
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1Y
                httpOnly: true,
            });

            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    };
}
