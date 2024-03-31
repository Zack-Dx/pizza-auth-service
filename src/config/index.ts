import { config } from "dotenv";
import path from "path";
config({ path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`) });

const {
    PORT,
    NODE_ENV,
    DB_NAME,
    DB_HOST,
    DB_USERNAME,
    DB_PASSWORD,
    DB_PORT,
    DOMAIN,
    REFRESH_TOKEN_SECRET,
} = process.env;

export const Config = {
    PORT: String(PORT),
    NODE_ENV: String(NODE_ENV),
    DB_NAME: String(DB_NAME),
    DB_HOST: String(DB_HOST),
    DB_USERNAME: String(DB_USERNAME),
    DB_PASSWORD: String(DB_PASSWORD),
    DB_PORT: Number(DB_PORT),
    DOMAIN: String(DOMAIN),
    REFRESH_TOKEN_SECRET: String(REFRESH_TOKEN_SECRET),
};
