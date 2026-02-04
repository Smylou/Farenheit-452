const bookWrapper = document.querySelector("#books")
const formulaire = document.querySelector("#form");
const booksList = document.querySelector("#booksListConfirm")
const formulaireRegister = document.querySelector("#registerForm");

// CREATION NOUVEAU LIVRE
formulaire?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    await addBook(data.get("newTitle"), data.get("newAuthor"), data.get("newDate"))
})

document.querySelector("#filterConfirm")?.addEventListener("click", getBookByTitle);
document.querySelector("#filterConfirm")?.addEventListener("click", getBookByAuthor);
document.querySelector("#filterConfirm")?.addEventListener("click", getBookByDate);

async function addBook(title, author, publicationDate) {
    const response = await fetch("http://localhost:3000/addBook", {
        method: "POST",
        body: JSON.stringify({ title, author, publicationDate }),
        headers: {
            'Content-type': "application/json"
        }
    });
    return response;
}


// AFFICHE TOUS LES LIVRES (TITRE/AUTEUR/DATE PUBLICATION)
let hide = document.createElement("button");

booksList?.addEventListener("click", async () => {

    const books = await getAllBooks();
    await displayBook(books);
    hide.textContent = "Fermer la liste"
    bookWrapper.appendChild(hide);
})
async function getAllBooks() {
    const response = await fetch("http://localhost:3000/allbooks", {
        method: "GET", // POST, PUT, PATCH, DELETE
        headers: {
            'Content-type': "application/json"
        }
    });
    const data = await response.json();
    return data;
}

async function displayBook(data) {

    let paragraph;

    data.forEach((book) => {
        paragraph = document.createElement("p");
        let del = document.createElement("button");
        del.textContent = "supprimer";
        paragraph.textContent = "Titre : " + book.title + ". Auteur: " + book.author + ". Date de publication : " + book.publicationDate + " "
        bookWrapper.appendChild(paragraph);
        paragraph.appendChild(del);
        hide.textContent = "Fermer la liste"
        bookWrapper.appendChild(hide);
    });
    hide.addEventListener("click", () => {
        bookWrapper.textContent = ""

    });
}

//AFFICHE RECHERCHE PAR RAPPORT AU FILTRE TITRE
async function getBookByTitle() {
    const inputTitleSearch = document.querySelector("#titleSearch")
    let titleSearch = inputTitleSearch.value


    const response = await fetch("http://localhost:3000/book/title/" + titleSearch, {
        method: "GET",
        headers: {
            'Content-type': "application/json"
        }
    });
    const books = await response.json();
    displayBook(books);
}



async function getBookByAuthor() {
    const inputAuthorSearch = document.querySelector("#authorSearch")
    let authorSearch = inputAuthorSearch.value
    const response = await fetch("http://localhost:3000/book/author/" + authorSearch, {
        method: "GET",
        headers: {
            'Content-type': "application/json"
        }
    });

    const books = await response.json();
    displayBook(books);
}

async function getBookByDate() {
    const inputDateSearch = document.querySelector("#dateSearch")
    let dateSearch = inputDateSearch.value
    const response = await fetch("http://localhost:3000/book/publicDate/" + dateSearch, {
        method: "GET",
        headers: {
            'Content-type': "application/json"
        }
    });

    const books = await response.json();
    displayBook(books);
}
