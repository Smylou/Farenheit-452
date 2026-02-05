import Groq from "groq-sdk";

// Initialiser Groq avec votre clé API
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export async function getRecommendation(req, res) {
    try {
        const { preferences, availableBooks } = req.body;

        if (!preferences || !availableBooks || availableBooks.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Préférences et livres disponibles requis"
            });
        }

        // Construire la liste des livres
        const booksList = availableBooks
            .map(book => `- "${book.title}" par ${book.author} (${book.publicationDate})`)
            .join('\n');

        // Créer le prompt pour l'IA
        const prompt = `Tu es un bibliothécaire expert et passionné. Un lecteur cherche une recommandation.

Préférences du lecteur :
- Genre préféré : ${preferences.genre}
- Auteur préféré : ${preferences.favoriteAuthor}
- Thème ou ambiance recherché : ${preferences.theme}
- Longueur préférée : ${preferences.length}

Voici les livres disponibles dans notre bibliothèque :
${booksList}

Mission : Recommande UN SEUL livre parmi cette liste qui correspond le mieux aux goûts du lecteur.

Réponds UNIQUEMENT au format JSON suivant (sans texte avant ou après) :
{
  "title": "Titre exact du livre recommandé",
  "reason": "Explication courte et enthousiaste (2-3 phrases) de pourquoi ce livre est parfait pour ce lecteur"
}`;

        console.log("Envoi de la requête à Groq...");

        // Appeler l'API Groq 
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Tu es un bibliothécaire expert. Tu réponds toujours en JSON valide, sans texte avant ou après."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: "llama-3.3-70b-versatile", // Modèle gratuit et performant
            temperature: 0.7,
            max_tokens: 500,
        });

        const responseText = chatCompletion.choices[0]?.message?.content || "";
        console.log("Réponse reçue:", responseText);

        // Extraire le JSON de la réponse
        let recommendationData;
        try {
            // Nettoyer la réponse pour extraire le JSON
            let cleanedText = responseText.trim();

            // Enlever les balises markdown si présentes
            cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                recommendationData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Format JSON non trouvé dans la réponse");
            }
        } catch (parseError) {
            console.error("Erreur de parsing:", parseError);
            console.error("Texte reçu:", responseText);

            // Fallback : recommandation aléatoire
            const randomBook = availableBooks[Math.floor(Math.random() * availableBooks.length)];
            recommendationData = {
                title: randomBook.title,
                reason: `Basé sur vos préférences pour le genre ${preferences.genre} et le thème ${preferences.theme}, ce livre pourrait vous plaire. C'est une œuvre de ${randomBook.author} qui mérite d'être découverte.`
            };
        }

        // Vérifier que le livre recommandé existe dans la liste
        const recommendedBook = availableBooks.find(
            book => book.title.toLowerCase().includes(recommendationData.title.toLowerCase()) ||
                recommendationData.title.toLowerCase().includes(book.title.toLowerCase())
        );

        if (!recommendedBook) {
            console.log("Livre recommandé non trouvé dans la liste, utilisation du fallback");
            // Si le livre n'existe pas, prendre le premier de la liste
            const fallbackBook = availableBooks[0];
            recommendationData.title = fallbackBook.title;
            recommendationData.reason = `Ce livre de ${fallbackBook.author} correspond bien à vos goûts pour le ${preferences.genre} et le thème ${preferences.theme}.`;
        }

        return res.json({
            success: true,
            recommendation: recommendationData
        });

    } catch (error) {
        console.error("Erreur lors de la recommandation:", error);

        // En cas d'erreur, faire une recommandation simple
        const { availableBooks, preferences } = req.body;
        if (availableBooks && availableBooks.length > 0) {
            const randomBook = availableBooks[Math.floor(Math.random() * availableBooks.length)];
            return res.json({
                success: true,
                recommendation: {
                    title: randomBook.title,
                    reason: `Basé sur votre intérêt pour le ${preferences.genre}, nous vous recommandons ce livre de ${randomBook.author}. C'est une excellente découverte !`
                }
            });
        }

        return res.status(500).json({
            success: false,
            message: "Erreur lors de la génération de la recommandation"
        });
    }
}