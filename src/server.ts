import app from "./app";
import logger from "./config/logger/logger";
import { Config } from "./config";

const { PORT } = Config;

const startServer = () => {
    try {
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

startServer();
