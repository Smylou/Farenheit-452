import "dotenv/config";
import express from "express";
import { userRouter } from "./routers/userRouter.js";
import { adminRouter } from "./routers/adminRouter.js";
import mongoose from "mongoose";
//import cors from "cors";

const port = process.env.PORT
const databaseUrl = process.env.URL_DATABASE
mongoose.set("strictQuery", true)
mongoose.connect(databaseUrl)

.then(() => {
        //SUCCESS(Reussie)
        console.log("connecter a la base de données");
    })
    .catch((error) => {
        //REJECT (echoué)
        console.error(error);
    })
    .finally(() => {
        console.log("fin de la promesse");

    })


const app = express()
//app.use(cors())
app.use(express.json())

//http://localhost:3000/
app.get('/', function(req, res){
res.sendFile("C:\Users\Edouard\Documents\developpement\Farenheit-452\front\index.html");
});

app.use(adminRouter)
app.use(userRouter)

app.listen(port, (error) => {
    if (error) {
        console.error(error);

    } else {
        console.log("le serveur a bien demarrer");

    }
})