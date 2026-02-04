import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true, minlength: 2, maxlength: 50 },
        lastName: { type: String, required: true, minlength: 2, maxlength: 50 },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, minlength: 8 },
        role: { type: String, enum: ["user", "admin"], default: "user" },
    },

    { timestamps: true }
);

export const User = mongoose.model("users", userSchema)