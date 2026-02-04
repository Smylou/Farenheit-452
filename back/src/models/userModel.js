import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, minlength: 2, maxlength: 50 },
    prenom: { type: String, required: true, minlength: 2, maxlength: 50 },
    mail: { type: String, required: true, unique: true, lowercase: true},
    pwd: { type: String, required: true },
    role: {type: String, enum: ["user", "admin"], default: "user"},
  },

  { timestamps: true }
);

export default mongoose.model("User", userSchema);