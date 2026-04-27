import express from 'express'
import * as moduleModel from '../models/moduleModel.js'

const router = express.Router()

// GET /modules
router.get('/', async (req, res) => {
  try {
    res.json(await moduleModel.getAllModules())
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT /modules/reorder — must be before /:id
router.put('/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds doit être un tableau' })
    }
    await moduleModel.reorderModules(orderedIds)
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /modules/:id
router.get('/:id', async (req, res) => {
  try {
    const module = await moduleModel.getModuleById(req.params.id)
    if (!module) return res.status(404).json({ error: 'Module non trouvé' })
    res.json(module)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /modules
router.post('/', async (req, res) => {
  try {
    if (!req.body.titre) {
      return res.status(400).json({ error: 'Titre requis' })
    }
    const module = await moduleModel.createModule(req.body)
    res.status(201).json(module)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PUT /modules/:id
router.put('/:id', async (req, res) => {
  try {
    const module = await moduleModel.updateModule(req.params.id, req.body)
    if (!module) return res.status(404).json({ error: 'Module non trouvé' })
    res.json(module)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// DELETE /modules/:id
router.delete('/:id', async (req, res) => {
  try {
    const module = await moduleModel.deleteModule(req.params.id)
    if (!module) return res.status(404).json({ error: 'Module non trouvé' })
    res.json({ message: 'Module supprimé avec succès', module })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
