
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
import {User} from "../models/userModel.js";

export async function register(req, res) { //Fonction asynchrone

  try {
    const { lastName, firstName, mail, password } = req.body;
    if (!lastName || !firstName || !email || !password) { // Vérifier que tout est bien rempli sinon message d'erreur
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.json({ message: "Adresse email invalide." });
    }

    if (password.length < 8) { // Vérifier que le MDP contient 8 caractères minimum

      return res.json({ message: "Mot de passe trop court (8 caractères minimum)." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() }); // Vérifier que l'utilisateur n'existe pas déjà 
    if (existingUser) {
      return res.json({ message: "Email déjà utilisé." });
    }

    const passwordHash = await bcrypt.hash(password, 12); // Code illisible, pour ne pas stocker le MDP en clair

    /** @type {User} user */
    const user = await User.create({ // Créer utilisateur
      lastName: lastName,
      firstName: firstName,
      email: email.toLowerCase(),
      password: passwordHash,
    });

    return res.json({ // Conditions remplies : Inscription réussie
      message: "Inscription réussie",
      user: {
        id: user._id,
        lastName: user.lastName,
        firstName: user.firstName,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) { // message d'erreur serveur
    console.error(error);
    res.status(500);
    return res.json({ message: "Erreur serveur :( )." });
  }
}