
const API_URL = "http://localhost:3000/api";


const bookWrapper = document.querySelector("#books");
const formulaire = document.querySelector("#form");
const booksList = document.querySelector("#booksListConfirm");
const formulaireRegister = document.querySelector("#formRegister");

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

// CORRECTION: Une seule fonction de filtre au lieu de 3 simultanées
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

// CORRECTION: Ajout de la gestion d'erreurs et conversion en number
async function addBook(title, author, publicationDate) {
    try {
        // Validation côté frontend
        if (!title || !author || !publicationDate) {
            alert("Veuillez remplir tous les champs");
            return;
        }
        
        // CORRECTION: Conversion en number
        const dateNumber = Number(publicationDate);
        if (isNaN(dateNumber)) {
            alert("La date de publication doit être un nombre valide");
            return;
        }
        
        //CORRECTION: URL avec /api
        const response = await fetch(`${API_URL}/addBook`, {
            method: "POST",
            body: JSON.stringify({ 
                title, 
                author, 
                publicationDate: dateNumber 
            }),
            headers: {
                'Content-type': "application/json",
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Ajout du token
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


// AFFICHE TOUS LES LIVRES (TITRE/AUTEUR/DATE PUBLICATION)
let hide = document.createElement("button");

if (booksList) {
    booksList.addEventListener("click", async () => {
        try {
            const books = await getAllBooks();
            if (bookWrapper) {
                bookWrapper.textContent = "";
                await displayBook(books);
                hide.textContent = "Fermer la liste";
                bookWrapper.appendChild(hide);
            }
        } catch (error) {
            console.error("Erreur:", error);
            alert("Impossible de récupérer la liste des livres");
        }
    });
}

// CORRECTION: URL avec /api et gestion d'erreurs
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
    
    let paragraph;

    data.forEach((book) => {
        paragraph = document.createElement("p");
        paragraph.className = "book-item";
        
        // CORRECTION: Bouton de suppression fonctionnel
        let del = document.createElement("button");
        del.textContent = "Supprimer";
        del.className = "btn-delete";
        
        // Ajout de l'event listener pour la suppression
        del.addEventListener("click", async () => {
            if (confirm(`Voulez-vous vraiment supprimer "${book.title}" ?`)) {
                const success = await deleteBook(book._id);
                if (success) {
                    paragraph.remove();
                    alert("Livre supprimé avec succès");
                }
            }
        });
        
        paragraph.textContent = `Titre: ${book.title}. Auteur: ${book.author}. Date de publication: ${book.publicationDate} `;
        bookWrapper.appendChild(paragraph);
        paragraph.appendChild(del);
    });
    
    hide.textContent = "Fermer la liste";
    bookWrapper.appendChild(hide);
    
    hide.addEventListener("click", () => {
        bookWrapper.textContent = "";
    });
}

// NOUVELLE FONCTION: Suppression de livre
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

// CORRECTION: URL avec /api
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

// CORRECTION: URL avec /api
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

//CORRECTION: URL avec /api
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

//NOUVELLE FONCTION: Rechercher les livres disponibles
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

// CORRECTION: Gestion du formulaire d'inscription avec vérification
if (formulaireRegister) {
    formulaireRegister.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = new FormData(event.target);
        
        const result = await addUser(
            data.get("mail"), 
            data.get("prenom"), 
            data.get("nom"), 
            data.get("pwd")
        );
        
        // Redirection après inscription réussie
        if (result && result.success) {
            alert("Inscription réussie ! Vous allez être redirigé vers la page de connexion.");
            setTimeout(() => {
                window.location.href = "/front/views/login.html";
            }, 1000);
        }
    });
}

// CORRECTION: URL avec /api et gestion d'erreurs
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
        
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            body: JSON.stringify({ mail, prenom, nom, pwd }),
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