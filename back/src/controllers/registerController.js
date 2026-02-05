
/*export async function addUser(req, res) {
    try {
        const data = req.body
        const user = new User(data)
        await user.save();
        res.json({ ok: true })
    } catch (error) {
        console.error(error);
        res.json({ ok: false, error: error })
    }
}
*/
import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import nodemailer from "nodemailer";

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function register(req, res) {
  //  LOG 1 : Fonction appelée
  console.log("\n========== INSCRIPTION DÉMARRÉE ==========");
  console.log(" Body reçu:", req.body);
  
  try {
    const { lastName, firstName, email, password } = req.body;
    
    //  LOG 2 : Données extraites
    console.log("Données extraites:");
    console.log("   - lastName:", lastName);
    console.log("   - firstName:", firstName);
    console.log("   - email:", email);
    console.log("   - password:", password ? "***présent***" : "ABSENT");
    
    // Validation des champs
    if (!lastName || !firstName || !email || !password) {
      console.log("Validation échouée: champs manquants");
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Validation échouée: email invalide");
      return res.status(400).json({ message: "Adresse email invalide." });
    }

    if (password.length < 8) {
      console.log(" Validation échouée: mot de passe trop court");
      return res.status(400).json({ message: "Mot de passe trop court (8 caractères minimum)." });
    }

    // Vérifier si l'utilisateur existe
    console.log(" Vérification si l'email existe déjà...");
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log(" Email déjà utilisé:", email);
      return res.status(409).json({ message: "Email déjà utilisé." });
    }

    // Hasher le mot de passe
    console.log("Hashage du mot de passe...");
    const passwordHash = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    console.log(" Création de l'utilisateur dans la base de données...");
    const user = await User.create({
      lastName: lastName,
      firstName: firstName,
      email: email.toLowerCase(),
      password: passwordHash,
    });

    console.log(` Utilisateur créé avec succès: ${user.firstName} ${user.lastName} (${user.email})`);

    // ENVOI DE L'EMAIL DE BIENVENUE (VERSION SIMPLE SANS HTML)
    console.log("Envoi de l'email de bienvenue...");
    try {
      const info = await transporter.sendMail({
        from: `"Farenheit-452 " <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Bienvenue sur Farenheit-452 ✔",
        text: `Bonjour ${user.firstName} ${user.lastName},

Votre compte a été créé avec succès !

Vous pouvez maintenant vous connecter et découvrir notre collection de livres.

Nous sommes ravis de vous compter parmi nos lecteurs.

À bientôt sur Farenheit-452 

---
Cet email a été envoyé automatiquement, merci de ne pas y répondre.
© 2025 Farenheit-452. Tous droits réservés.`
      });
      
      console.log("Email de bienvenue envoyé avec succès!");
      console.log("   Message ID:", info.messageId);
    } catch (emailError) {
      console.error("ERREUR lors de l'envoi de l'email:", emailError.message);
      console.error("   Détails:", emailError);
      // On continue même si l'email échoue
    }

    console.log("Inscription terminée avec succès!");
    console.log("========================================\n");

    return res.status(201).json({
      message: "Inscription réussie",
      success: true,
      user: {
        id: user._id,
        lastName: user.lastName,
        firstName: user.firstName,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("========== ERREUR SERVEUR ==========");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("========================================\n");
    return res.status(500).json({ message: "Erreur serveur." });
  }
}