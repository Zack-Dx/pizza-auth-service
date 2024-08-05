import { checkSchema } from "express-validator";

export default checkSchema({
    email: {
        errorMessage: "Email is required!",
        notEmpty: true,
        trim: true,
        isEmail: {
            errorMessage: "Email format isn't correct!",
        },
    },
    password: {
        errorMessage: "Password is required!",
        notEmpty: true,
        trim: true,
    },
});
