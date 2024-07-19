import { sign, JwtPayload } from "jsonwebtoken";
import createHttpError from "http-errors";
import { Config } from "../config";
import { isLeapYear } from "../utils/helpers";
import { RefreshToken } from "../entity/RefreshToken";
import fs from "node:fs/promises";
import path from "node:path";
import { User } from "../entity/User";
import { Repository } from "typeorm";

export class TokenService {
    constructor(private refreshTokenRepository: Repository<RefreshToken>) {}
    async generateAccessToken(payload: JwtPayload) {
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
            throw error;
        }

        const accessToken = sign(payload, privateKey, {
            algorithm: "RS256",
            expiresIn: "1h",
            issuer: "auth-service",
        });
        return accessToken;
    }

    generateRefreshToken(payload: JwtPayload) {
        const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET, {
            algorithm: "HS256",
            expiresIn: "1Y",
            issuer: "auth-service",
            jwtid: String(payload.id),
        });
        return refreshToken;
    }

    async persistRefreshToken(user: User) {
        const MS_IN_DAY = 1000 * 60 * 60 * 24;
        const MS_IN_YEAR = MS_IN_DAY * 365;
        const MS_IN_LEAP_YEAR = MS_IN_DAY * 366;
        const currentYear = new Date().getFullYear();

        const MS = isLeapYear(currentYear) ? MS_IN_LEAP_YEAR : MS_IN_YEAR;

        const newRefreshToken = await this.refreshTokenRepository.save({
            user: user,
            expiresAt: new Date(Date.now() + MS),
        });

        return newRefreshToken;
    }
}
