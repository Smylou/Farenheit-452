const API_URL = "http://localhost:3000/api";

// Vérifier si l'utilisateur est connecté
window.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }

    // Afficher les infos utilisateur
    document.getElementById('user-info').textContent = `Bonjour ${user.nom} ${user.prenom}`;

    // Afficher le formulaire de création si admin
    if (user.role === 'admin') {
        document.getElementById('create-section').style.display = 'block';
    }

   
});

// Déconnexion
document.getElementById('btn-logout').addEventListener('click', function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
});

