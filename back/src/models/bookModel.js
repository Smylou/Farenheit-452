import mongoose from "mongoose";

const bookSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, "le nom du livre est obligatoire"]
    },
    author: {
        type: String,
        required: [true, "le nom de l'auteur est obligatoire"]
    },
    publicationDate: {
        type: String,
        required: [true, "la date de parution est obligatoire"]
    },
    available: {
        type: Boolean, default: true
        // si false alors PAS DISPO
    }

})

export const Books = mongoose.model("books", bookSchema)