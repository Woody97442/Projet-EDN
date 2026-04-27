import express from 'express'
import * as userModel from '../models/userModel.js'

const router = express.Router()

// GET /users - Récupérer tous les utilisateurs
router.get('/', async (req, res) => {
  try {
    const users = await userModel.getAllUsers()
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /users/:id - Récupérer un utilisateur par ID
router.get('/:id', async (req, res) => {
  try {
    const user = await userModel.getUserById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /users - Créer un nouvel utilisateur
router.post('/', async (req, res) => {
  try {
    const { email, password, role } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' })
    }
    
    const user = await userModel.createUser({ email, password, role })
    res.status(201).json(user)
  } catch (error) {
    if (error.message.includes('ccir-campus.re')) {
      return res.status(403).json({ error: error.message })
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' })
    }
    res.status(500).json({ error: error.message })
  }
})

// PUT /users/:id - Mettre à jour un utilisateur
router.put('/:id', async (req, res) => {
  try {
    const { email, password, role } = req.body
    
    if (email) {
      const domain = email.split('@')[1]
      if (domain !== 'ccir-campus.re') {
        return res.status(403).json({ error: 'Seuls les emails du domaine ccir-campus.re sont autorisés' })
      }
    }
    
    const user = await userModel.updateUser(req.params.id, { email, password, role })
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }
    res.json(user)
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' })
    }
    res.status(500).json({ error: error.message })
  }
})

// DELETE /users/:id - Supprimer un utilisateur
router.delete('/:id', async (req, res) => {
  try {
    const user = await userModel.deleteUser(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }
    res.json({ message: 'Utilisateur supprimé avec succès', user })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
