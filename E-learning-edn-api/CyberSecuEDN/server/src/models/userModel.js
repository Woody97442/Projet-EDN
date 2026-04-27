import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// Créer un utilisateur
export const createUser = async (userData) => {
  try {
    const { email, password, role = 'user' } = userData
    
    // Vérification du nom de domaine
    const domain = email.split('@')[1]
    if (domain !== 'ccir-campus.re') {
      throw new Error('Seuls les emails du domaine ccir-campus.re sont autorisés')
    }
    
    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role
      }
    })
    
    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    throw error
  }
}

// Récupérer tous les utilisateurs
export const getAllUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
    return users
  } catch (error) {
    throw error
  }
}

// Récupérer un utilisateur par ID
export const getUserById = async (id) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
    return user
  } catch (error) {
    throw error
  }
}

// Récupérer un utilisateur par email
export const getUserByEmail = async (email) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })
    return user
  } catch (error) {
    throw error
  }
}

// Mettre à jour un utilisateur
export const updateUser = async (id, updateData) => {
  try {
    const { email, password, role } = updateData
    
    // Si un nouveau mot de passe est fourni, le hasher
    let hashedPassword
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10)
    }
    
    const updateFields = {}
    if (email) updateFields.email = email
    if (hashedPassword) updateFields.password = hashedPassword
    if (role) updateFields.role = role
    
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateFields,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
    
    return user
  } catch (error) {
    throw error
  }
}

// Supprimer un utilisateur
export const deleteUser = async (id) => {
  try {
    const user = await prisma.user.delete({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
    return user
  } catch (error) {
    throw error
  }
}
