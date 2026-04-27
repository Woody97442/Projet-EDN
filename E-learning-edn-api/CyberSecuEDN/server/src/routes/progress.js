import express from 'express'
import * as progressModel from '../models/progressModel.js'
import authenticateToken from '../middleware/token.js'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// POST /progress — mark a module as visited (auth required)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { moduleId, formationId } = req.body
    if (!moduleId || !formationId) {
      return res.status(400).json({ error: 'moduleId et formationId requis' })
    }

    const user = await prisma.user.findUnique({ where: { email: req.user.email } })
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' })

    const progress = await progressModel.markModuleViewed({
      userId: user.id,
      moduleId,
      formationId
    })
    res.json(progress)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /progress/me — all progress for authenticated user (auth required)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user.email } })
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' })

    const progress = await progressModel.getProgressByUser(user.id)
    res.json(progress)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
