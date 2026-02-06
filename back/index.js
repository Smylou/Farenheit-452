import 'dotenv/config'
console.log("=== VÉRIFICATION .ENV ===");
console.log("PORT:", process.env.PORT);
console.log("URL_DATABASE:", process.env.URL_DATABASE);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Défini" : "Undefined");
console.log("========================")
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import loginRouter from "./src/routers/loginRouter.js";  
import { bookRouter } from "./src/routers/bookRouter.js"; 
import registerRouter from "./src/routers/registerRouter.js";
import recommendationRouter from './src/routers/recommendationRouter.js';


mongoose.connect(process.env.URL_DATABASE)
    .then(() => console.log("Connecté à MongoDB avec succès"))
    .catch((err) => console.error("Erreur de connexion MongoDB :", err));
mongoose.set("strictQuery", true);

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", loginRouter);    
app.use("/api", bookRouter);    
app.use("/api", registerRouter);
app.use('/api', recommendationRouter);   

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});