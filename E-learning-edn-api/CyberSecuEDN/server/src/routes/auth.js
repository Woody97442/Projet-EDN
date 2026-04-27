import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import authenticateToken from '../middleware/token.js';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// Register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

  const domain = email.split('@')[1];
  if (domain !== 'ccir-campus.re') return res.status(403).json({ error: 'Seuls les emails du domaine ccir-campus.re sont autorisés' });

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return res.status(409).json({ error: 'Utilisateur déjà existant' });

  const hash = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: { email, password: hash, role: 'user' }
  });

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ user: userWithoutPassword });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Mot de passe invalide' });

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
  const { password: _, ...userWithoutPassword } = user;
  res.json({ token, user: userWithoutPassword });
});

// /me
router.get('/me', authenticateToken, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.user.email } });
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

export default router;
