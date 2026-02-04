document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");
    const message = document.getElementById("message");

    //Si formulaire existe, alors:
    if (form) {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const data = new FormData(form);

            //Création utilisateur 
            try {
                const response = await fetch("http://localhost:3000/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: data.get("email"),
                        firstName: data.get("firstName"),
                        lastName: data.get("lastName"),
                        password: data.get("password"),
                    }),
                });

                const result = await response.json();
                message.textContent = result.message || "Compte créé";
            } catch (error) {
                console.error(error);
                message.textContent = "Erreur lors de l'inscription";
            }
        });
    }
});
