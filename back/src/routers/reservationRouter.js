import express from "express";
import {
  createReservation,
  getAllReservations,
} from "../controllers/reservationController.js";
import LoginController from "../controllers/loginController.js";

const router = express.Router();

// Route pour le User connecté : créer une résa
router.post("/reservations", LoginController.verifyToken, createReservation);

// Route pour l'Admin : voir toutes les résa
router.get("/reservations", LoginController.verifyToken, getAllReservations);

export default router;