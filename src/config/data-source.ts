import "reflect-metadata";
import { Config } from ".";
import { DataSource } from "typeorm";
import { User } from "../entity/User";
import { RefreshToken } from "../entity/RefreshToken";

const { DB_NAME, DB_HOST, DB_USERNAME, DB_PASSWORD, DB_PORT } = Config;

export const AppDataSource = new DataSource({
    type: "postgres",
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    // Don't use this in production.
    synchronize: true,
    logging: false,
    entities: [User, RefreshToken],
    migrations: [],
    subscribers: [],
});
