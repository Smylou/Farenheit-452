import 'dotenv/config'
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import loginRouter from "./src/routers/loginRouter.js";  
import { bookRouter } from "./src/routers/bookRouter.js"; 
import registerRouter from "./src/routers/registerRouter.js";


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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});