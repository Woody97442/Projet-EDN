import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const markModuleViewed = async ({ userId, moduleId, formationId }) => {
  return prisma.userProgress.upsert({
    where: { userId_moduleId: { userId: parseInt(userId), moduleId: parseInt(moduleId) } },
    update: { viewedAt: new Date() },
    create: { userId: parseInt(userId), moduleId: parseInt(moduleId), formationId: parseInt(formationId) }
  })
}

export const getProgressByUser = async (userId) => {
  return prisma.userProgress.findMany({
    where: { userId: parseInt(userId) }
  })
}

export const getProgressByUserAndFormation = async (userId, formationId) => {
  return prisma.userProgress.findMany({
    where: { userId: parseInt(userId), formationId: parseInt(formationId) }
  })
}
