import express from 'express'
import * as quizzModel from '../models/quizzModel.js'
import * as attemptModel from '../models/attemptModel.js'
import authenticateToken from '../middleware/token.js'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// GET /quizz
router.get('/', async (req, res) => {
  try {
    res.json(await quizzModel.getAllQuizz())
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /quizz/formation/:formationId  — must be before /:id
router.get('/formation/:formationId', async (req, res) => {
  try {
    res.json(await quizzModel.getQuizzByFormation(req.params.formationId))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /quizz/:id
router.get('/:id', async (req, res) => {
  try {
    const quizz = await quizzModel.getQuizzById(req.params.id)
    if (!quizz) return res.status(404).json({ error: 'Quiz non trouvé' })
    res.json(quizz)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /quizz — upsert (create or update)
router.post('/', async (req, res) => {
  try {
    const { id_formation, titre, contenu, passThreshold } = req.body
    if (!id_formation || !titre) {
      return res.status(400).json({ error: 'ID de formation et titre requis' })
    }

    const existing = await quizzModel.getQuizzByFormation(id_formation)
    if (existing) {
      const updated = await quizzModel.updateQuizz(existing.id, { id_formation, titre, contenu, passThreshold })
      return res.json(updated)
    }

    const quizz = await quizzModel.createQuizz({ id_formation, titre, contenu, passThreshold })
    return res.status(201).json(quizz)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT /quizz/:id
router.put('/:id', async (req, res) => {
  try {
    const { id_formation, titre, contenu, passThreshold } = req.body
    const quizz = await quizzModel.updateQuizz(req.params.id, { id_formation, titre, contenu, passThreshold })
    if (!quizz) return res.status(404).json({ error: 'Quiz non trouvé' })
    res.json(quizz)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE /quizz/:id
router.delete('/:id', async (req, res) => {
  try {
    const quizz = await quizzModel.deleteQuizz(req.params.id)
    if (!quizz) return res.status(404).json({ error: 'Quiz non trouvé' })
    res.json({ message: 'Quiz supprimé avec succès', quizz })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /quizz/:id/submit — save attempt (auth required)
router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const { score, passed } = req.body

    if (score === undefined || passed === undefined) {
      return res.status(400).json({ error: 'score et passed requis' })
    }

    const quizz = await quizzModel.getQuizzById(req.params.id)
    if (!quizz) return res.status(404).json({ error: 'Quiz non trouvé' })

    // Resolve userId from token email
    const user = await prisma.user.findUnique({ where: { email: req.user.email } })
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' })

    const attempt = await attemptModel.createAttempt({
      userId: user.id,
      quizId: quizz.id,
      formationId: quizz.id_formation,
      score: parseInt(score),
      passed: !!passed
    })

    res.status(201).json(attempt)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /quizz/attempts/me — user's quiz attempts (auth required)
router.get('/attempts/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user.email } })
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' })

    const attempts = await attemptModel.getAttemptsByUser(user.id)
    res.json(attempts)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
