import Reservation from "../models/reservationModel.js";
import Book from "../models/bookModel.js";

// Si user connecté,  emprunter un livre dispo
export async function createReservation(req, res) {
    try {
        const { bookId, startDate, endDate } = req.body;

        if (!bookId || !startDate || !endDate) {
            return res.status(400).json({
                ok: false,
                error: "Le titre du livre, la date de début et la date de fin sont requis"
            });
        }

        // Utilisateur connecté
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                ok: false,
                error: "Utilisateur non authentifié",
            });
        }

        // Convertir les dates
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                ok: false,
                error: "Dates invalides"
            });
        }

        if (end <= start) {
            return res.status(400).json({
                ok: false,
                error: "La date de fin doit être après la date de début"
            });
        }

        // Vérifier chevauchement sur la même ressource (même livre)
        // overlap si existing.StartDate <= end ET existing.endDate >= start
        const conflict = await Reservation.findOne({
            Book: bookId,
            status: "active",
            StartDate: { $lte: end },
            endDate: { $gte: start }
        });

        if (conflict) {
            return res.status(409).json({
                ok: false,
                error: "Ce livre est déjà réservé sur cette période"
            });
        }

        // Création réservation
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                ok: false,
                error: "Ce livre n'existe pas"
            })
        }

        const reservationData = {
            Book: book,
            User: userId,
            StartDate: start,
            endDate: end,
        };

        const reservation = await Reservation.create(reservationData);

        return res.status(201).json({
            ok: true,
            message: "Réservation créée avec succès",
            reservation,
        });

    } catch (error) {
        console.error(error);

        if (error.name === "ValidationError") {
            return res.status(400).json({ ok: false, error: error.message });
        }

        return res.status(500).json({
            ok: false,
            error: "Erreur création réservation",
        });
    }
}

//Voir toutes les réservations pour l'Admin
export async function getAllReservations(req, res) {
    try {
        const { status } = req.query;

        const filter = {};
        if (status) filter.status = status;

        const reservations = await Reservation.find(filter).populate("Book").sort({ createdAt: -1 });

        return res.json({
            ok: true,
            reservations,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            error: "Erreur récupération réservations",
        });
    }
}

