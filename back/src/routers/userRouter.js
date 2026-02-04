import express from "express";
import { register } from "../controllers/registerController.js";

export const userRouter = express.Router()
userRouter.post("/register", register)
