import app from "./app";
import logger from "./config/logger/logger";
import { Config } from "./config";
import { AppDataSource } from "./config/data-source";

const { PORT } = Config;

const startServer = async () => {
    try {
        await AppDataSource.initialize();
        logger.info("Database Connected Successfully.");
        app.listen(PORT, () => {
            logger.info(`Server listening on port ${PORT}`);
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(error.message);
            logger.on("finish", () => {
                process.exit(1);
            });
        }
    }
};

void startServer();
