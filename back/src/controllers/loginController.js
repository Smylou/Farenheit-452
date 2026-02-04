import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

class LoginController {
    
    // Connexion
    static async login(req, res) {
        const { login_mail, login_pass } = req.body;

        try {
          
            const user = await User.findOne({ mail: login_mail });
            
            if (!user) {
                return res.status(401).json({ message: "Email ou mot de passe incorrect" });
            }

            
            const isPasswordValid = await bcrypt.compare(login_pass, user.pwd);
            
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Email ou mot de passe incorrect" });
            }

            const token = jwt.sign(
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: "Connexion réussie",
                token: token,
                user: {
                    id: user._id,
                    
                    prenom: user.prenom, 
                    nom: user.nom, 
                    mail: user.mail,
                    role: user.role
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erreur serveur" });
        }
    }

    // Vérifier le token JWT
    static verifyToken(req, res, next) {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ message: "Token manquant" });
        }

        try {
            const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ message: "Token invalide" });
        }
    }

    // Vérifier si admin
    static checkAdmin(req, res, next) {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Accès refusé. Admin uniquement." });
        }
        next();
    }
}

export default LoginController;