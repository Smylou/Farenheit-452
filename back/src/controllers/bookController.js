import Books from "../models/bookModel.js";

// AMÉLIORATION: Ajout de la validation des données
export async function addBook(req, res) {
    try {
        const { title, author, publicationDate } = req.body;
        
        // Validation des champs requis
        if (!title || !author || !publicationDate) {
            return res.status(400).json({ 
                ok: false, 
                error: "Tous les champs sont requis (title, author, publicationDate)" 
            });
        }
        
        // Validation du type de publicationDate
        if (typeof publicationDate !== 'number') {
            return res.status(400).json({ 
                ok: false, 
                error: "La date de publication doit être un nombre" 
            });
        }
        
        // Validation de la plage de dates (optionnel mais recommandé)
        if (publicationDate < 1000 || publicationDate > new Date().getFullYear() + 10) {
            return res.status(400).json({ 
                ok: false, 
                error: "La date de publication doit être valide" 
            });
        }
        
        const book = new Books({ title, author, publicationDate });
        await book.save();
        
        // AMÉLIORATION: Retourner le livre créé avec un statut 201
        res.status(201).json({ ok: true, book: book });
    } catch (error) {
        console.error(error);
        //AMÉLIORATION: Retourner le message d'erreur au lieu de l'objet complet
        res.status(500).json({ ok: false, error: error.message });
    }
}

export async function getAllBooks(req, res) {
    try {
        const books = await Books.find({}, "title author publicationDate available");
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, error: error.message });
    }
}

export async function getBookByTitle(req, res) {
    const title = req.params.title;
    try {
        if (!title || title.trim() === '') {
            return res.status(400).json({ ok: false, error: "Le titre est requis" });
        }
        
        const regex = new RegExp(title.trim().replace(/\s+/g, ".*"), "i");
        const books = await Books.find({ title: { $regex: regex } });
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, error: error.message });
    }
}

export async function getBookByAuthor(req, res) {
    const author = req.params.author;
    try {
        if (!author || author.trim() === '') {
            return res.status(400).json({ ok: false, error: "L'auteur est requis" });
        }
        
        const regex = new RegExp(author.trim().replace(/\s+/g, ".*"), "i");
        const books = await Books.find({ author: { $regex: regex } });
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, error: error.message });
    }
}

export async function getBookByDate(req, res) {
    const publicationDate = req.params.publicationDate;
    try {
        // AMÉLIORATION: Conversion en number
        const dateNumber = Number(publicationDate);
        
        if (isNaN(dateNumber)) {
            return res.status(400).json({ 
                ok: false, 
                error: "La date de publication doit être un nombre valide" 
            });
        }
        
        const books = await Books.find({ publicationDate: dateNumber });
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, error: error.message });
    }
}

// CORRECTION CRITIQUE: Conversion du paramètre string en boolean
export async function getAvailableBook(req, res) {
    const availableParam = req.params.available;
    try {
        // Conversion string vers boolean
        const available = availableParam === 'true';
        
        const books = await Books.find({ available: available });
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, error: error.message });
    }
}

// NOUVELLE FONCTION: Suppression d'un livre
export async function deleteBook(req, res) {
    const bookId = req.params.id;
    try {
        // Validation de l'ID
        if (!bookId) {
            return res.status(400).json({ ok: false, error: "L'ID du livre est requis" });
        }
        
        const book = await Books.findByIdAndDelete(bookId);
        
        if (!book) {
            return res.status(404).json({ ok: false, error: "Livre non trouvé" });
        }
        
        res.json({ ok: true, message: "Livre supprimé avec succès", book: book });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, error: error.message });
    }
}

// NOUVELLE FONCTION: Mise à jour d'un livre
export async function updateBook(req, res) {
    const bookId = req.params.id;
    try {
        const { title, author, publicationDate, available } = req.body;
        
        // Validation de l'ID
        if (!bookId) {
            return res.status(400).json({ ok: false, error: "L'ID du livre est requis" });
        }
        
        // Créer un objet avec seulement les champs fournis
        const updateData = {};
        if (title) updateData.title = title;
        if (author) updateData.author = author;
        if (publicationDate !== undefined) {
            if (typeof publicationDate !== 'number') {
                return res.status(400).json({ 
                    ok: false, 
                    error: "La date de publication doit être un nombre" 
                });
            }
            updateData.publicationDate = publicationDate;
        }
        if (available !== undefined) updateData.available = available;
        
        const book = await Books.findByIdAndUpdate(
            bookId, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if (!book) {
            return res.status(404).json({ ok: false, error: "Livre non trouvé" });
        }
        
        res.json({ ok: true, book: book });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, error: error.message });
    }
}

//NOUVELLE FONCTION: Récupérer un livre par son ID
export async function getBookById(req, res) {
    const bookId = req.params.id;
    try {
        if (!bookId) {
            return res.status(400).json({ ok: false, error: "L'ID du livre est requis" });
        }
        
        const book = await Books.findById(bookId);
        
        if (!book) {
            return res.status(404).json({ ok: false, error: "Livre non trouvé" });
        }
        
        res.json(book);
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, error: error.message });
    }
}