import { NextFunction, Response } from "express";
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { Config } from "../config";
import { JwtPayload } from "jsonwebtoken";
import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/RefreshToken";
import { isLeapYear } from "../utils/helpers";
import { TokenService } from "../services/TokenService";

const { DOMAIN } = Config;

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
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

            const accessToken =
                await this.tokenService.generateAccessToken(payload);

            // Expiry based on leap year check
            const MS_IN_DAY = 1000 * 60 * 60 * 24;
            const MS_IN_YEAR = MS_IN_DAY * 365;
            const MS_IN_LEAP_YEAR = MS_IN_DAY * 366;
            const currentYear = new Date().getFullYear();
            const MS = isLeapYear(currentYear) ? MS_IN_LEAP_YEAR : MS_IN_YEAR;

            // Persisting the refresh token
            const refreshTokenRepository =
                AppDataSource.getRepository(RefreshToken);

            const newRefreshToken = await refreshTokenRepository.save({
                user: user,
                expiresAt: new Date(Date.now() + MS),
            });

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

            res.cookie("refreshToken", refreshToken, {
                domain: DOMAIN,
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1Y
                httpOnly: true,
            });

            return res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    };
}
