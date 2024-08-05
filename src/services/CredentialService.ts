import bcrypt from "bcryptjs";

export class CredentialService {
    async validatePassword(userPass: string, hashedPass: string) {
        return await bcrypt.compare(userPass, hashedPass);
    }
}
