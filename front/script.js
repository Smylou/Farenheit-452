const bookWrapper = document.querySelector("#books")
const formulaire = document.querySelector("#form");
const list = document.querySelector("#listRecipes")
const hide = document.createElement("button")

//ECOUTEURS EVENT
formulaire.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    await createRecipe(data.get("title"), data.get("category"))
})

// fct fermer marche aps encore
list.addEventListener("click", async (event) => {
    await display();
    hide.textContent = "Fermer la liste"
    bookWrapper.appendChild(hide);
});
hide.addEventListener("click", async (event) => {
  
    await display();
});


async function createBook(titre, category) {
    const response = await fetch("http://localhost:3000/books", {
        method: "POST", // POST, PUT, PATCH, DELETE
        body: JSON.stringify({ titre, category }),
        headers: {
            'Content-type': "application/json"
        }
    });
    return response;
}

async function display() {
    const data = await getBooks();

    let paragraph;

    data.forEach((recipe) => {
        paragraph = document.createElement("p")
        paragraph.textContent = recipe.titre
        bookWrapper.appendChild(paragraph);
    });
}


async function getBooks() {
    const response = await fetch("http://localhost:3000/recipes", {
        method: "GET", // POST, PUT, PATCH, DELETE
        headers: {
            'Content-type': "application/json"
        }
    });
    const data = await response.json();
    return data;
}


