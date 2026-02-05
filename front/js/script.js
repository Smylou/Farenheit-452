const API_URL = "http://localhost:3000/api";

console.log("✓ Fichier script.js chargé");

// === INITIALISATION AU CHARGEMENT DU DOM ===
window.addEventListener('DOMContentLoaded', function() {
    console.log("✓ DOM chargé");
    
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
    }

    // Afficher les sections admin
    if (user.role === 'admin') {
        console.log("✓ Utilisateur admin détecté");
        
        const createSection = document.getElementById('create-section');
        const addBookSection = document.getElementById('addBook');
        
        if (createSection) createSection.style.display = 'block';
        if (addBookSection) addBookSection.style.display = 'block';
    }

    // Gestion de la déconnexion
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            console.log("✓ Déconnexion");
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/front/views/login.html';
        });
        console.log("✓ Event listener de déconnexion attaché");
    }

    // Initialiser la modale
    initModal();
    initRecommendationModal();
});

// === ÉLÉMENTS DOM ===
const bookWrapper = document.querySelector("#books");
const formulaire = document.querySelector("#form");
const booksList = document.querySelector("#booksListConfirm");
const filterBtn = document.querySelector("#filterConfirm");
const availableBtn = document.querySelector("#availableSearch");

// === GESTION DE LA MODALE ===
let currentBookId = null;
const modal = document.getElementById("editModal");
const closeBtn = document.querySelector(".close");
const cancelBtn = document.querySelector(".btn-cancel");
const editForm = document.getElementById("editForm");

function initModal() {
    if (!modal || !closeBtn || !cancelBtn || !editForm) return;

    // Fermer avec le X
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Fermer avec le bouton Annuler
    cancelBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Fermer en cliquant à l'extérieur
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Gérer la soumission du formulaire
    editForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        const newTitle = document.getElementById("editTitle").value;
        const newAuthor = document.getElementById("editAuthor").value;
        const newDate = document.getElementById("editDate").value;
        
        if (newTitle && newAuthor && newDate) {
            await updateBook(currentBookId, newTitle, newAuthor, Number(newDate));
            modal.style.display = "none";
        }
    });
}

function openEditModal(book) {
    if (!modal) return;
    
    currentBookId = book._id;
    
    // Pré-remplir les champs
    document.getElementById("editTitle").value = book.title;
    document.getElementById("editAuthor").value = book.author;
    document.getElementById("editDate").value = book.publicationDate;
    
    // Afficher la modale
    modal.style.display = "block";
}

// === GESTION DE LA MODALE DE RECOMMANDATION ===
function initRecommendationModal() {
    const btnRecommendation = document.getElementById("btnRecommendation");
    const recommendationModal = document.getElementById("recommendationModal");
    const closeRecommendation = document.querySelector(".close-recommendation");
    const cancelRecommendation = document.querySelector(".btn-cancel-recommendation");
    const recommendationForm = document.getElementById("recommendationForm");
    const btnNewRecommendation = document.getElementById("btnNewRecommendation");

    if (!btnRecommendation || !recommendationModal) return;

    // Ouvrir la modale
    btnRecommendation.addEventListener("click", () => {
        recommendationModal.style.display = "block";
        document.getElementById("recommendationResult").style.display = "none";
        document.getElementById("recommendationForm").style.display = "block";
        recommendationForm.reset();
    });

    // Fermer avec le X
    if (closeRecommendation) {
        closeRecommendation.addEventListener("click", () => {
            recommendationModal.style.display = "none";
        });
    }

    // Fermer avec le bouton Annuler
    if (cancelRecommendation) {
        cancelRecommendation.addEventListener("click", () => {
            recommendationModal.style.display = "none";
        });
    }

    // Fermer en cliquant à l'extérieur
    window.addEventListener("click", (event) => {
        if (event.target === recommendationModal) {
            recommendationModal.style.display = "none";
        }
    });

    // Soumettre le formulaire
    if (recommendationForm) {
        recommendationForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            await getAIRecommendation();
        });
    }

    // Nouvelle recommandation
    if (btnNewRecommendation) {
        btnNewRecommendation.addEventListener("click", () => {
            document.getElementById("recommendationResult").style.display = "none";
            document.getElementById("recommendationForm").style.display = "block";
            recommendationForm.reset();
        });
    }
}

async function getAIRecommendation() {
    const genre = document.getElementById("genre").value;
    const favoriteAuthor = document.getElementById("favoriteAuthor").value;
    const theme = document.getElementById("theme").value;
    const length = document.getElementById("length").value;

    const btnGetRecommendation = document.getElementById("btnGetRecommendation");
    const btnText = btnGetRecommendation.querySelector(".btn-text");
    const btnLoader = btnGetRecommendation.querySelector(".btn-loader");

    try {
        // Afficher le loader
        btnText.style.display = "none";
        btnLoader.style.display = "inline";
        btnGetRecommendation.disabled = true;

        // Récupérer tous les livres disponibles
        const books = await getAllBooks();

        if (!books || books.length === 0) {
            alert("Aucun livre disponible dans la bibliothèque pour faire une recommandation.");
            return;
        }

        // Préparer les préférences
        const preferences = {
            genre,
            favoriteAuthor: favoriteAuthor || "Aucun auteur spécifique",
            theme,
            length
        };

        // Appeler l'API de recommandation
        const response = await fetch(`${API_URL}/recommendation`, {
            method: "POST",
            headers: {
                'Content-Type': "application/json",
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                preferences,
                availableBooks: books
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Afficher le résultat
            document.querySelector(".recommended-title").textContent = 
                `📖 ${data.recommendation.title}`;
            document.querySelector(".recommendation-reason").textContent = 
                data.recommendation.reason;

            document.getElementById("recommendationForm").style.display = "none";
            document.getElementById("recommendationResult").style.display = "block";
        } else {
            alert("Erreur: " + (data.message || "Impossible d'obtenir une recommandation"));
        }

    } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur de connexion au serveur. Veuillez réessayer.");
    } finally {
        // Restaurer le bouton
        btnText.style.display = "inline";
        btnLoader.style.display = "none";
        btnGetRecommendation.disabled = false;
    }
}

// === CRÉATION NOUVEAU LIVRE ===
if (formulaire) {
    formulaire.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = new FormData(event.target);
        await addBook(data.get("newTitle"), data.get("newAuthor"), data.get("newDate"));
        event.target.reset();
    });
}

// === GESTION DES FILTRES ===
if (filterBtn) {
    filterBtn.addEventListener("click", async () => {
        const titleSearch = document.querySelector("#titleSearch").value;
        const authorSearch = document.querySelector("#authorSearch").value;
        const dateSearch = document.querySelector("#dateSearch").value;

        if (bookWrapper) {
            bookWrapper.textContent = "";
        }

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

// === AFFICHER TOUS LES LIVRES ===
if (booksList) {
    booksList.addEventListener("click", async () => {
        try {
            bookWrapper.style.display = "block";
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

// === LIVRES DISPONIBLES ===
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

// === FONCTIONS API ===
async function addBook(title, author, publicationDate) {
    try {
        if (!title || !author || !publicationDate) {
            alert("Veuillez remplir tous les champs");
            return;
        }

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
        paragraph.textContent = `TITRE: ${book.title}. Auteur: ${book.author}. Date de publication: ${book.publicationDate} `;
        bookWrapper.appendChild(paragraph);

        // Boutons admin
        if (isAdmin) {
            // Bouton Modifier
            const edit = document.createElement("button");
            edit.textContent = "Modifier";
            edit.className = "btn-edit";
            edit.addEventListener("click", () => {
                openEditModal(book);
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

    // Bouton Fermer
    const hide = document.createElement("button");
    hide.textContent = "Fermer la liste";
    hide.className = "btn-close";
    hide.addEventListener("click", () => {
        bookWrapper.style.display = "none";
    });
    bookWrapper.appendChild(hide);
}

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