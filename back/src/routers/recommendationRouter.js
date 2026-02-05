import express from "express";
import { getRecommendation } from "../controllers/recommendationController.js";
import LoginController from "../controllers/loginController.js";

const router = express.Router();

router.post("/recommendation", LoginController.verifyToken, getRecommendation);

export default router;