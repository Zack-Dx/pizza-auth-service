import app from "./app";
import { Config } from "./config";

const { PORT } = Config;

const startServer = () => {
    try {
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

startServer();
