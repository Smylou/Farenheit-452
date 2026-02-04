const API_URL = "http://localhost:3000/api";

console.log("✓ Fichier script.js chargé");

// ATTENDRE QUE LE DOM SOIT PRÊT
window.addEventListener('DOMContentLoaded', function() {
    console.log("✓ DOM chargé");
    
    // Vérifier l'authentification
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    console.log("Token:", token ? "Présent" : "Absent");
    console.log("User:", user);

    if (!token || !user) {
        console.log("⚠ Pas de token, redirection vers login");
        window.location.href = '/front/views/login.html';
        return;
    }

    // Afficher les infos utilisateur
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        userInfo.textContent = `Bonjour ${user.lastName} ${user.firstName}`;
        console.log("✓ Info utilisateur affichée");
    } else {
        console.error("✗ Élément user-info introuvable");
    }

    // Afficher les sections admin
    if (user.role === 'admin') {
        console.log("✓ Utilisateur admin détecté");
        
        const createSection = document.getElementById('create-section');
        const addBookSection = document.getElementById('addBook');
        
        if (createSection) {
            createSection.style.display = 'block';
            console.log("✓ Section admin affichée");
        }
        
        if (addBookSection) {
            addBookSection.style.display = 'block';
            console.log("✓ Formulaire ajout affiché");
        }
    }

    // GESTION DE LA DÉCONNEXION
    const btnLogout = document.getElementById('btn-logout');
    console.log("Bouton logout trouvé:", btnLogout);
    
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            console.log("✓ Clic sur déconnexion détecté");
            e.preventDefault();
            
            // Nettoyer le localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            console.log("✓ LocalStorage nettoyé");
            
            // Rediriger
            console.log("✓ Redirection vers login.html");
            window.location.href = '/front/views/login.html';
        });
        console.log("✓ Event listener de déconnexion attaché");
    } else {
        console.error("✗ ERREUR : Bouton btn-logout introuvable dans le DOM !");
    }
});

const bookWrapper = document.querySelector("#books");
const formulaire = document.querySelector("#form");
const booksList = document.querySelector("#booksListConfirm");

// CREATION NOUVEAU LIVRE
if (formulaire) {
    formulaire.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = new FormData(event.target);
        await addBook(data.get("newTitle"), data.get("newAuthor"), data.get("newDate"));

        // Vider le formulaire après succès
        event.target.reset();
    });
}

// Gestion des filtres de recherche
const filterBtn = document.querySelector("#filterConfirm");
if (filterBtn) {
    filterBtn.addEventListener("click", async () => {
        const titleSearch = document.querySelector("#titleSearch").value;
        const authorSearch = document.querySelector("#authorSearch").value;
        const dateSearch = document.querySelector("#dateSearch").value;

        // Vider l'affichage précédent
        if (bookWrapper) {
            bookWrapper.textContent = "";
        }

        // Chercher selon le filtre rempli (priorité: titre > auteur > date)
        if (titleSearch) {
            await getBookByTitle();
        } else if (authorSearch) {
            await getBookByAuthor();
        } else if (dateSearch) {
            await getBookByDate();
        } else {
            alert("Veuillez remplir au moins un filtre de recherche");
        }
    });
}

async function addBook(title, author, publicationDate) {
    try {
        // Validation côté frontend
        if (!title || !author || !publicationDate) {
            alert("Veuillez remplir tous les champs");
            return;
        }

        // Conversion en number
        const dateNumber = Number(publicationDate);
        if (isNaN(dateNumber)) {
            alert("La date de publication doit être un nombre valide");
            return;
        }

        const response = await fetch(`${API_URL}/addBook`, {
            method: "POST",
            body: JSON.stringify({
                title,
                author,
                publicationDate: dateNumber
            }),
            headers: {
                'Content-type': "application/json",
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert("Livre ajouté avec succès !");
            // Rafraîchir la liste
            const books = await getAllBooks();
            if (bookWrapper) {
                bookWrapper.textContent = "";
                await displayBook(books);
            }
        } else {
            alert("Erreur: " + (data.error || data.message || "Impossible d'ajouter le livre"));
        }

        return response;
    } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur de connexion au serveur");
    }
}

// AFFICHE TOUS LES LIVRES
let hide = document.createElement("button");

if (booksList) {
    booksList.addEventListener("click", async () => {
        try {
            const books = await getAllBooks();
            if (bookWrapper) {
                bookWrapper.textContent = "";
                await displayBook(books);
            }
        } catch (error) {
            console.error("Erreur:", error);
            alert("Impossible de récupérer la liste des livres");
        }
    });
}

async function getAllBooks() {
    try {
        const response = await fetch(`${API_URL}/allbooks`, {
            method: "GET",
            headers: {
                'Content-type': "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des livres");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur de connexion au serveur");
        return [];
    }
}

async function displayBook(data) {
    if (!bookWrapper) return;

    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user && user.role === 'admin';

    data.forEach((book) => {
        const paragraph = document.createElement("p");
        paragraph.className = "book-item";

        // Texte du livre
        paragraph.textContent = `Titre: ${book.title}. Auteur: ${book.author}. Date de publication: ${book.publicationDate} `;
        bookWrapper.appendChild(paragraph);

        // Boutons admin
        if (isAdmin) {
            // Bouton Modifier
            const edit = document.createElement("button");
            edit.textContent = "Modifier";
            edit.className = "btn-edit";
            edit.addEventListener("click", async () => {
                const newTitle = prompt("Nouveau titre:", book.title);
                const newAuthor = prompt("Nouvel auteur:", book.author);
                const newDate = prompt("Nouvelle date:", book.publicationDate);

                if (newTitle && newAuthor && newDate) {
                    await updateBook(book._id, newTitle, newAuthor, Number(newDate));
                }
            });
            paragraph.appendChild(edit);

            // Bouton Supprimer
            const del = document.createElement("button");
            del.textContent = "Supprimer";
            del.className = "btn-delete";
            del.addEventListener("click", async () => {
                if (confirm(`Voulez-vous vraiment supprimer "${book.title}" ?`)) {
                    const success = await deleteBook(book._id);
                    if (success) {
                        paragraph.remove();
                        alert("Livre supprimé avec succès");
                    }
                }
            });
            paragraph.appendChild(del);
        }
    });

    hide.textContent = "Fermer la liste";
    bookWrapper.appendChild(hide);

    hide.addEventListener("click", () => {
        bookWrapper.textContent = "";
    });
}

// FONCTION: Mise à jour d'un livre
async function updateBook(id, title, author, publicationDate) {
    try {
        const response = await fetch(`${API_URL}/book/${id}`, {
            method: "PUT",
            body: JSON.stringify({
                title,
                author,
                publicationDate
            }),
            headers: {
                'Content-type': "application/json",
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            alert("Livre modifié avec succès !");
            // Rafraîchir la liste
            const books = await getAllBooks();
            if (bookWrapper) {
                bookWrapper.textContent = "";
                await displayBook(books);
            }
            return true;
        } else {
            const data = await response.json();
            alert("Erreur: " + (data.message || "Impossible de modifier le livre"));
            return false;
        }
    } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur de connexion au serveur");
        return false;
    }
}

// FONCTION: Suppression de livre
async function deleteBook(id) {
    try {
        const response = await fetch(`${API_URL}/book/${id}`, {
            method: "DELETE",
            headers: {
                'Content-type': "application/json",
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            return true;
        } else {
            const data = await response.json();
            alert("Erreur: " + (data.message || "Impossible de supprimer le livre"));
            return false;
        }
    } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur de connexion au serveur");
        return false;
    }
}

async function getBookByTitle() {
    try {
        const inputTitleSearch = document.querySelector("#titleSearch");
        if (!inputTitleSearch) return;

        let titleSearch = inputTitleSearch.value.trim();

        if (!titleSearch) {
            alert("Veuillez entrer un titre à rechercher");
            return;
        }

        const response = await fetch(`${API_URL}/book/title/${titleSearch}`, {
            method: "GET",
            headers: {
                'Content-type': "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Erreur lors de la recherche");
        }

        const books = await response.json();

        if (books.length === 0) {
            alert("Aucun livre trouvé avec ce titre");
        } else {
            displayBook(books);
        }
    } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur de connexion au serveur");
    }
}

async function getBookByAuthor() {
    try {
        const inputAuthorSearch = document.querySelector("#authorSearch");
        if (!inputAuthorSearch) return;

        let authorSearch = inputAuthorSearch.value.trim();

        if (!authorSearch) {
            alert("Veuillez entrer un auteur à rechercher");
            return;
        }

        const response = await fetch(`${API_URL}/book/author/${authorSearch}`, {
            method: "GET",
            headers: {
                'Content-type': "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Erreur lors de la recherche");
        }

        const books = await response.json();

        if (books.length === 0) {
            alert("Aucun livre trouvé pour cet auteur");
        } else {
            displayBook(books);
        }
    } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur de connexion au serveur");
    }
}

async function getBookByDate() {
    try {
        const inputDateSearch = document.querySelector("#dateSearch");
        if (!inputDateSearch) return;

        let dateSearch = inputDateSearch.value.trim();

        if (!dateSearch) {
            alert("Veuillez entrer une année à rechercher");
            return;
        }

        const response = await fetch(`${API_URL}/book/publicDate/${dateSearch}`, {
            method: "GET",
            headers: {
                'Content-type': "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Erreur lors de la recherche");
        }

        const books = await response.json();

        if (books.length === 0) {
            alert("Aucun livre trouvé pour cette année");
        } else {
            displayBook(books);
        }
    } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur de connexion au serveur");
    }
}

// Rechercher les livres disponibles
const availableBtn = document.querySelector("#availableSearch");
if (availableBtn) {
    availableBtn.addEventListener("click", async () => {
        try {
            const response = await fetch(`${API_URL}/book/available/true`, {
                method: "GET",
                headers: {
                    'Content-type': "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la recherche");
            }

            const books = await response.json();

            if (bookWrapper) {
                bookWrapper.textContent = "";
                if (books.length === 0) {
                    alert("Aucun livre disponible pour le moment");
                } else {
                    displayBook(books);
                }
            }
        } catch (error) {
            console.error("Erreur:", error);
            alert("Erreur de connexion au serveur");
        }
    });
}