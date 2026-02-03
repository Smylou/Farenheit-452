import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    nom: {
        type: String,
        required: [true, " Le nom est obligatoire"]
    },
    prenom: {
        type: String,
        required: [true, " Le prénom est obligatoire"]
    },
    mail: {
        type: String,
        required: [true, " Le mail est obligatoire"]
    },
    pwd: {
        type: String,
        required: [true, " Le mot de passe est obligatoire"]
    },

    // A METTRE PAR DEFAULT = 0
    isAdmin: {
        type: Boolean, default: false

    },


})

export const User = mongoose.model("users", userSchema)