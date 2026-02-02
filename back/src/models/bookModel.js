import mongoose from "mongoose";

const bookSchema = mongoose.Schema({
    nom: {
        type: String,
        required: [true, "le nom du livre est obligatoire"]
    },
    Auteur: {
        type: String,
        required: [true, "le nom de l'auteur est obligatoire"]
    },
    publicationDate: {
        type: Date,
        required: [true, "la date de parution est obligatoire"]
    },

})

export const Books = mongoose.model("books", bookSchema)