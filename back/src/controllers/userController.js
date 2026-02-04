import bcrypt from "bcrypt";
import User from "../models/userModel.js";

export async function register(req, res) {
  try {
    //Récupération des données du formulaire (nom, prenom, mail, pwd)
    const { lastName, firstName, email, password } = req.body;
    
    // Vérifier que tous les champs sont remplis
    if (!lastName || !firstName || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    // Validation de l'email - UTILISER 'mail'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Adresse email invalide." });
    }

    //  Vérifier la longueur du mot de passe - UTILISER 'pwd'
    if (password.length < 8) {
      return res.status(400).json({ message: "Mot de passe trop court (8 caractères minimum)." });
    }

    // Vérifier que l'utilisateur n'existe pas déjà - UTILISER 'mail'
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email déjà utilisé." });
    }

    // Hasher le mot de passe - UTILISER 'pwd'
    const passwordHash = await bcrypt.hash(password, 12);

    // Créer l'utilisateur avec les bons noms de champs
    const user = await User.create({
      lastName: lastName,
      firstName: firstName,
      email: email.toLowerCase(),
      password: passwordHash,
    });

    // Inscription réussie - retourner les bonnes propriétés
    return res.status(201).json({
      message: "Inscription réussie",
      user: {
        id: user._id,
        lastName: user.lastName,
        firstName: user.firstName,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
}