import { config } from "dotenv";
config();

const { PORT, NODE_ENV } = process.env;

export const Config = {
    PORT: String(PORT),
    NODE_ENV: String(NODE_ENV),
};
