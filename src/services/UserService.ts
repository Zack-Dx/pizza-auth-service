import { Repository } from "typeorm";
import { User } from "../entity/User";
import { UserData } from "../types";
import { Roles } from "../constants";
import createHttpError from "http-errors";
import bcrypt from "bcryptjs";

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async create({ firstName, lastName, email, password }: UserData) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (user) {
            const error = createHttpError(400, "Email already exists!");
            throw error;
        }

        // Hashing the Password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        try {
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: Roles.customer,
            });
        } catch (error) {
            const customError = createHttpError(
                500,
                "Failed to store the data in the database.",
            );
            throw customError;
        }
    }
}
