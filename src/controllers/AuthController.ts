import { Request, Response } from "express";

export class AuthController {
    register = (req: Request, res: Response): void => {
        res.status(201).json({ message: "Well Done" });
    };
}
