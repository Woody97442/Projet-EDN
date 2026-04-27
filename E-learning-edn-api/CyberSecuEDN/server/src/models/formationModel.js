import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Créer une formation
export const createFormation = async (formationData) => {
  try {
    const { titre } = formationData
    const isActive = false
    const formation = await prisma.formation.create({
      data: {
        titre,
        isActive
      }
    })
    return formation
  } catch (error) {
    throw error
  }
}

// Récupérer toutes les formations
export const getAllFormations = async () => {
  try {
    const formations = await prisma.formation.findMany()
    return formations
  } catch (error) {
    throw error
  }
}

// Récupérer une formation par ID
export const getFormationById = async (id) => {
  try {
    const formation = await prisma.formation.findUnique({
      where: { id: parseInt(id) }
    })
    return formation
  } catch (error) {
    throw error
  }
}

// Mettre à jour une formation
export const updateFormation = async (id, updateData) => {
  try {
    const { titre, isActive } = updateData
    const updateFields = {}
    if (titre !== undefined) updateFields.titre = titre
    if (isActive !== undefined) updateFields.isActive = isActive
    const formation = await prisma.formation.update({
      where: { id: parseInt(id) },
      data: updateFields
    })
    return formation
  } catch (error) {
    throw error
  }
}


// Supprimer une formation
export const deleteFormation = async (id) => {
  try {
    const formation = await prisma.formation.delete({
      where: { id: parseInt(id) }
    })
    return formation
  } catch (error) {
    throw error
  }
}
