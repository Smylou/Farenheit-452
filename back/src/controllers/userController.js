import bcrypt from "bcrypt";
import User from "../models/userModel.js";

export async function register(req, res) {
  try {
    //Récupération des données du formulaire (nom, prenom, mail, pwd)
    const { nom, prenom, mail, pwd } = req.body;
    
    // Vérifier que tous les champs sont remplis
    if (!nom || !prenom || !mail || !pwd) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    // Validation de l'email - UTILISER 'mail'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(mail)) {
      return res.status(400).json({ message: "Adresse email invalide." });
    }

    //  Vérifier la longueur du mot de passe - UTILISER 'pwd'
    if (pwd.length < 8) {
      return res.status(400).json({ message: "Mot de passe trop court (8 caractères minimum)." });
    }

    // Vérifier que l'utilisateur n'existe pas déjà - UTILISER 'mail'
    const existingUser = await User.findOne({ mail: mail.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email déjà utilisé." });
    }

    // Hasher le mot de passe - UTILISER 'pwd'
    const passwordHash = await bcrypt.hash(pwd, 12);

    // Créer l'utilisateur avec les bons noms de champs
    const user = await User.create({
      nom: nom,
      prenom: prenom,
      mail: mail.toLowerCase(),
      pwd: passwordHash,
    });

    // Inscription réussie - retourner les bonnes propriétés
    return res.status(201).json({
      message: "Inscription réussie",
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        mail: user.mail,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
}