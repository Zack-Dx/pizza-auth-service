import logger from "./config/logger/logger";
import express, { Request, Response, NextFunction } from "express";
import { HttpError } from "http-errors";
import { authRouter } from "./routes/auth";

const app = express();

app.use("/auth", authRouter);

app.get("/health", (req, res) => {
    res.send("Hello");
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                message: err.message,
                path: "",
                location: "",
            },
        ],
    });
});

export default app;
