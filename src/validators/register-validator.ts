import { checkSchema } from "express-validator";

export default checkSchema({
    firstName: {
        errorMessage: "Firstname is required!",
        notEmpty: true,
        trim: true,
    },
    lastName: {
        errorMessage: "Lastname is required!",
        notEmpty: true,
        trim: true,
    },
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
        isLength: {
            options: { min: 8 },
            errorMessage: "Password should be at least 8 chars",
        },
    },
});
