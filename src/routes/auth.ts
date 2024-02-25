import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { UserService } from "../services/UserService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";

const authRouter = Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
authRouter.post("/register", (req, res) => authController.register(req, res));

export { authRouter };
