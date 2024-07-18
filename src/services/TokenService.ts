import { sign, JwtPayload } from "jsonwebtoken";
import fs from "node:fs/promises";
import path from "node:path";
import createHttpError from "http-errors";
import { Config } from "../config";

export class TokenService {
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
}
