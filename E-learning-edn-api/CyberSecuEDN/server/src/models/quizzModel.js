import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createQuizz = async (quizzData) => {
  const { id_formation, titre, contenu, passThreshold = 80 } = quizzData
  return prisma.quizz.create({
    data: {
      id_formation: parseInt(id_formation),
      titre,
      contenu: contenu || {},
      passThreshold
    }
  })
}

export const hasQuizzForFormation = async (formationId) => {
  const existing = await prisma.quizz.findFirst({
    where: { id_formation: parseInt(formationId) }
  })
  return !!existing
}

export const getAllQuizz = async () => {
  return prisma.quizz.findMany()
}

export const getQuizzById = async (id) => {
  return prisma.quizz.findUnique({ where: { id: parseInt(id) } })
}

export const getQuizzByFormation = async (formationId) => {
  return prisma.quizz.findFirst({
    where: { id_formation: parseInt(formationId) }
  })
}

export const updateQuizz = async (id, updateData) => {
  const { id_formation, titre, contenu, passThreshold } = updateData
  const fields = {}
  if (id_formation) fields.id_formation = parseInt(id_formation)
  if (titre) fields.titre = titre
  if (contenu) fields.contenu = contenu
  if (passThreshold !== undefined) fields.passThreshold = parseInt(passThreshold)

  return prisma.quizz.update({ where: { id: parseInt(id) }, data: fields })
}

export const deleteQuizz = async (id) => {
  return prisma.quizz.delete({ where: { id: parseInt(id) } })
}
