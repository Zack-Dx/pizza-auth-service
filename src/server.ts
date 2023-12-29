import app from "./app";
import { Config } from "./config";
import logger from "./config/logger/logger";

const { PORT } = Config;

const startServer = () => {
    try {
        app.listen(PORT, () => {
            logger.info(`Server listening on port ${PORT}`);
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(error.message);
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        }
    }
};

startServer();
