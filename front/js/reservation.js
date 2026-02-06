
console.log("✓ Fichier reservation.js chargé");

window.addEventListener("DOMContentLoaded", async () => {
  console.log("✓ DOM chargé (reservation)");

  const selectBook = document.getElementById("selectBookId");
  const reservationForm = document.getElementById("reservationForm");

  // Remplir le select avec les livres dispo qui ne sont pas empruntés
  if (selectBook) {
    await loadAvailableBooks(selectBook);
  }

  // Soumission réservation
  if (reservationForm) {
    reservationForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const data = new FormData(event.target);

      // On prend l’ID du livre depuis le select
      const bookId = selectBook ? selectBook.value : null;

      const startDate = data.get("reservationStartDate");
      const endDate = data.get("reservationEndDate");

      const result = await addReservation(bookId, startDate, endDate);

      if (result && result.success) {
        alert("Réservation réussie !");
        reservationForm.reset();

        // Recharger la liste dispo après réservation
        if (selectBook) {
          await loadAvailableBooks(selectBook);
        }
      }
    });
  }
});

// Charger les livres disponibles et remplir le select
async function loadAvailableBooks(selectBook) {
  try {
    selectBook.innerHTML = `<option value=""> Choisir un livre disponible</option>`;

    const response = await fetch(`${API_URL}/books/availables`);
    const payload = await response.json();

    if (!response.ok) {
      alert(payload.error || payload.message || "Erreur chargement livres disponibles");
      return;
    }

    payload.books.forEach((book) => {
      const opt = document.createElement("option");
      opt.value = book._id;
      opt.textContent = `${book.title} — ${book.author} (${book.publicationDate})`;
      selectBook.appendChild(opt);
    });

  } catch (error) {
    console.error("Erreur loadAvailableBooks:", error);
    alert("Erreur de connexion au serveur");
  }
}

// Réserver un livre (avec bookId)
async function addReservation(bookId, reservationStartDate, reservationEndDate) {
  try {
    if (!bookId || !reservationStartDate || !reservationEndDate) {
      alert("Veuillez choisir un livre et remplir toutes les dates");
      return { success: false };
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vous devez être connecté(e) pour faire une réservation");
      return { success: false };
    }

    const response = await fetch(`${API_URL}/reservations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        bookId, //ID du livre
        startDate: reservationStartDate,
        endDate: reservationEndDate,
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      alert("Erreur: " + (payload.error || payload.message || "Erreur réservation"));
      return { success: false, data: payload };
    }

    return { success: true, data: payload };

  } catch (error) {
    console.error("Erreur addReservation:", error);
    alert("Erreur de connexion au serveur");
    return { success: false };
  }
}