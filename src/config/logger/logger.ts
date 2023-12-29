import winston from "winston";
import { Config } from "../index";

const { NODE_ENV } = Config;

const logger = winston.createLogger({
    level: "info",
    defaultMeta: {
        serviceName: "auth-service",
    },
    transports: [
        new winston.transports.File({
            level: "info",
            dirname: "logs",
            filename: "combined.log",
            silent: NODE_ENV === "test",
        }),
        new winston.transports.File({
            level: "error",
            dirname: "logs",
            filename: "error.log",
            silent: NODE_ENV === "test",
        }),
        new winston.transports.Console({
            level: "info",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            silent: NODE_ENV === "test",
        }),
    ],
});

export default logger;
