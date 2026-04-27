import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createAttempt = async ({ userId, quizId, formationId, score, passed }) => {
  return prisma.quizAttempt.create({
    data: { userId, quizId, formationId, score, passed }
  })
}

export const getAttemptsByUser = async (userId) => {
  return prisma.quizAttempt.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { createdAt: 'desc' }
  })
}

export const getBestAttemptByUserAndFormation = async (userId, formationId) => {
  return prisma.quizAttempt.findFirst({
    where: { userId: parseInt(userId), formationId: parseInt(formationId) },
    orderBy: { score: 'desc' }
  })
}
