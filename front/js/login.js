const listeBoutons = document.querySelectorAll('.btn-toggle');

const svgOeilOuvert = "/front/images/visibility-on.svg";
const svgOeilFerme = "/front/images/visibility-off.svg";

const API_URL = "http://localhost:3000/api";

document.addEventListener('DOMContentLoaded', function () {

    // Toggle password visibility
    listeBoutons.forEach(function (bouton) {
        bouton.addEventListener('click', function () {
            const inputCible = this.previousElementSibling;

            if (inputCible.type === "password") {
                inputCible.type = "text";
                this.innerHTML = `<img src="${svgOeilOuvert}" alt="Masquer">`;
            } else {
                inputCible.type = "password";
                this.innerHTML = `<img src="${svgOeilFerme}" alt="Masquer">`;
            }
        });
    });

    // Connexion
    const btnLogin = document.getElementById("btn-login");
    const form = document.querySelector("form");

    btnLogin.addEventListener("click", async function(e) {
        e.preventDefault();

        const email = document.querySelector('input[name="login_mail"]').value;
        const password = document.querySelector('input[name="login_pass"]').value;

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    login_mail: email,
                    login_pass: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Sauvegarder le token
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Rediriger vers app.html
                window.location.href = 'app.html';
            } else {
                alert(data.message);
            }

        } catch (error) {
            console.error("Erreur:", error);
            alert("Erreur de connexion");
        }
    });
});