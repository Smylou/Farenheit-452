import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    lastName : { type: String, required: true, minlength: 2, maxlength: 50 },
    firstName: { type: String, required: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true},
    password: { type: String, required: true },
    role: {type: String, enum: ["user", "admin"], default: "user"},
  },

  { timestamps: true }
);

export default mongoose.model("User", userSchema);
