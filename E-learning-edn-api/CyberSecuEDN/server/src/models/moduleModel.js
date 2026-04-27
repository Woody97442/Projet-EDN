import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createModule = async (moduleData) => {
  const { titre, sousTitre, texte, video = null, image = null, id_formation, order = 0 } = moduleData
  return prisma.module.create({
    data: {
      titre,
      sousTitre: sousTitre ?? '',
      texte: texte ?? '',
      video: video || null,
      image: image || null,
      id_formation: id_formation ? parseInt(id_formation) : undefined,
      order
    }
  })
}

export const getAllModules = async () => {
  return prisma.module.findMany({ orderBy: { order: 'asc' } })
}

export const getModuleById = async (id) => {
  return prisma.module.findUnique({ where: { id: parseInt(id) } })
}

export const getModulesByFormation = async (id_formation) => {
  return prisma.module.findMany({
    where: { id_formation: parseInt(id_formation) },
    orderBy: { order: 'asc' }
  })
}

export const updateModule = async (id, updateData) => {
  const { titre, sousTitre, texte, video, image, id_formation, order } = updateData
  const fields = {}
  if (titre !== undefined) fields.titre = titre
  if (sousTitre !== undefined) fields.sousTitre = sousTitre ?? ''
  if (texte !== undefined) fields.texte = texte ?? ''
  if (video !== undefined) fields.video = video || null
  if (image !== undefined) fields.image = image || null
  if (id_formation !== undefined) fields.id_formation = parseInt(id_formation)
  if (order !== undefined) fields.order = parseInt(order)

  return prisma.module.update({ where: { id: parseInt(id) }, data: fields })
}

export const reorderModules = async (orderedIds) => {
  const updates = orderedIds.map((id, index) =>
    prisma.module.update({ where: { id: parseInt(id) }, data: { order: index } })
  )
  return Promise.all(updates)
}

export const deleteModule = async (id) => {
  return prisma.module.delete({ where: { id: parseInt(id) } })
}
