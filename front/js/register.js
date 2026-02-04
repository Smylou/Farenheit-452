const API_URL = "http://localhost:3000/api";

console.log("✓ Fichier register.js chargé");

window.addEventListener('DOMContentLoaded', function() {
    console.log("✓ DOM chargé");
    
    const formulaireRegister = document.querySelector("#registerForm");

    if (formulaireRegister) {
        formulaireRegister.addEventListener("submit", async (event) => {
            event.preventDefault();
            const data = new FormData(event.target);

            const result = await addUser(
                data.get("email"),
                data.get("firstName"),
                data.get("lastName"),
                data.get("password")
            );

            // Redirection après inscription réussie
            if (result && result.success) {
                alert("Inscription réussie ! Vous allez être redirigé vers la page de connexion.");
                setTimeout(() => {
                    window.location.href = "../views/login.html";
                }, 1000);
            }
        });
    }
});

async function addUser(mail, prenom, nom, pwd) {
    try {
        // Validation côté frontend
        if (!mail || !prenom || !nom || !pwd) {
            alert("Tous les champs sont requis");
            return { success: false };
        }

        if (pwd.length < 8) {
            alert("Le mot de passe doit contenir au moins 8 caractères");
            return { success: false };
        }

        // Validation du format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(mail)) {
            alert("Veuillez entrer une adresse email valide");
            return { success: false };
        }

        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            body: JSON.stringify({ 
                email: mail, 
                firstName: prenom, 
                lastName: nom, 
                password: pwd 
            }),
            headers: {
                'Content-type': "application/json"
            }
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, data: data };
        } else {
            alert("Erreur: " + (data.message || "Impossible de créer le compte"));
            return { success: false };
        }
    } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur de connexion au serveur");
        return { success: false };
    }
}