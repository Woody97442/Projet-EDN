import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET

// Middleware pour vérifier le token
export default function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) return res.status(401).json({ error: "Token manquant" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token invalide" });
    req.user = user; // ici tu peux stocker les infos du token pour les routes suivantes
    next();
  });
}
