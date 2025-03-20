const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Configuration de la session
app.use("/customer", session({
  secret: "fingerprint_customer", // Clé secrète pour signer la session
  resave: true, // Force la sauvegarde de la session même si elle n'a pas été modifiée
  saveUninitialized: true // Sauvegarde une session même si elle est vide
}));

// Middleware d'authentification
app.use("/customer/auth/*", function auth(req, res, next) {
  // Vérifier si l'utilisateur a un token dans la session
  if (req.session.authorization && req.session.authorization.accessToken) {
    const token = req.session.authorization.accessToken; // Récupérer le token

    // Vérifier le token JWT
    jwt.verify(token, "access", (err, user) => {
      if (err) {
        // Si le token est invalide ou expiré
        return res.status(403).json({ message: "User not authenticated" });
      } else {
        // Si le token est valide, ajouter l'utilisateur à la requête
        req.user = user;
        next(); // Autoriser l'accès à la route
      }
    });
  } else {
    // Si aucun token n'est trouvé dans la session
    return res.status(403).json({ message: "User not logged in" });
  }
});

const PORT = 5000;

// Routes pour les utilisateurs authentifiés
app.use("/customer", customer_routes);

// Routes publiques
app.use("/", genl_routes);

// Démarrer le serveur
app.listen(PORT, () => console.log("Server is running on port " + PORT));