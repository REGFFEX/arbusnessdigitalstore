import prisma from '../utils/prismaClient'

export async function prismaGetProducts(limit = 100) {
  return prisma.products.findMany({ orderBy: { created_at: 'desc' }, take: limit })
}

export async function prismaGetProductById(id: string) {
  return prisma.products.findUnique({ where: { id } })
}
