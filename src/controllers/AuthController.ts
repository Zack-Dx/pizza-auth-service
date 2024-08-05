import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { Config } from "../config";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/TokenService";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";
import { isLeapYear } from "../utils/helpers";

const { DOMAIN } = Config;

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService,
    ) {}

    register = async (
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) => {
        // Validating Request
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
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

            const accessToken =
                await this.tokenService.generateAccessToken(payload);

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: newRefreshToken.id,
            });

            res.cookie("accessToken", accessToken, {
                domain: DOMAIN,
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1h
                httpOnly: true,
            });

            const MS_IN_DAY = 1000 * 60 * 60 * 24;
            const currentYear = new Date().getFullYear();
            const expiryInDays = isLeapYear(currentYear) ? 366 : 365;
            const maxAge = MS_IN_DAY * expiryInDays;

            res.cookie("refreshToken", refreshToken, {
                domain: DOMAIN,
                sameSite: "strict",
                maxAge, // Based on year either leap or not
                httpOnly: true,
            });
            return res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    };

    login = async (
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) => {
        // Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { email, password } = req.body;

        this.logger.debug("New request to login a user", {
            email,
            password: "****",
        });

        try {
            const user = await this.userService.findByEmail(email);
            if (!user) {
                const error = createHttpError(404, "User not found.");
                throw error;
            }

            const passMatch = await this.credentialService.validatePassword(
                password,
                user.password,
            );

            if (!passMatch) {
                const error = createHttpError(401, "Invalid Credentials.");
                throw error;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken =
                await this.tokenService.generateAccessToken(payload);

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: newRefreshToken.id,
            });

            res.cookie("accessToken", accessToken, {
                domain: DOMAIN,
                sameSite: "strict",
                maxAge: 1000 * 60 * 60, // 1h
                httpOnly: true,
            });

            const MS_IN_DAY = 1000 * 60 * 60 * 24;
            const currentYear = new Date().getFullYear();
            const expiryInDays = isLeapYear(currentYear) ? 366 : 365;
            const maxAge = MS_IN_DAY * expiryInDays;

            res.cookie("refreshToken", refreshToken, {
                domain: DOMAIN,
                sameSite: "strict",
                maxAge, // Based on year either leap or not
                httpOnly: true,
            });

            this.logger.info("User has logged in.", { id: user.id });

            return res.status(200).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    };
}
