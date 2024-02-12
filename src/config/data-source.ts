import "reflect-metadata";
import { Config } from ".";
import { DataSource } from "typeorm";
import { User } from "../entity/User";

const { NODE_ENV, DB_NAME, DB_HOST, DB_USERNAME, DB_PASSWORD, DB_PORT } =
    Config;

export const AppDataSource = new DataSource({
    type: "postgres",
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    // Don't use this in production.
    synchronize: NODE_ENV === "test" || NODE_ENV === "dev",
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
});