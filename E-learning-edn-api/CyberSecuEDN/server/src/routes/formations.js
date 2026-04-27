import express from 'express'
import * as formationModel from '../models/formationModel.js'
import * as moduleModel from '../models/moduleModel.js'
import * as quizzModel from '../models/quizzModel.js'

const router = express.Router()

// GET /formations - Récupérer toutes les formations
router.get('/', async (req, res) => {
  try {
    const formations = await formationModel.getAllFormations()
    res.json(formations)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /formations/:id - Récupérer une formation par ID
router.get('/:id', async (req, res) => {
  try {
    const formation = await formationModel.getFormationById(req.params.id)
    if (!formation) {
      return res.status(404).json({ error: 'Formation non trouvée' })
    }
    res.json(formation)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /formations/:id/modules - Récupérer les modules d'une formation
router.get('/:id/modules', async (req, res) => {
  try {
    const modules = await moduleModel.getModulesByFormation(req.params.id)
    res.json(modules)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /formations/:id/quizz - Récupérer les quizz d'une formation
router.get('/:id/quizz', async (req, res) => {
  try {
    const quizz = await quizzModel.getQuizzByFormation(req.params.id)
    res.json(quizz)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /formations - Créer une nouvelle formation
router.post('/', async (req, res) => {
  try {
    const { titre } = req.body
    
    if (!titre) {
      return res.status(400).json({ error: 'Titre requis' })
    }
    
    const formation = await formationModel.createFormation({ titre })
    res.status(201).json(formation)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT /formations/:id - Mettre à jour une formation
router.put('/:id', async (req, res) => {
  try {
      const formation = await formationModel.updateFormation(req.params.id, req.body)  

      if (!formation) {
      return res.status(404).json({ error: 'Formation non trouvée' })
    }
    res.json(formation)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE /formations/:id - Supprimer une formation
router.delete('/:id', async (req, res) => {
  try {
    const formation = await formationModel.deleteFormation(req.params.id)
    if (!formation) {
      return res.status(404).json({ error: 'Formation non trouvée' })
    }
    res.json({ message: 'Formation supprimée avec succès', formation })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
