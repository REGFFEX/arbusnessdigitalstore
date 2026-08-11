import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const projectCount = await prisma.products.count({
        where: {
            is_project: true
        }
    })
    console.log(`Total projects found: ${projectCount}`)

    if (projectCount > 0) {
        const projects = await prisma.products.findMany({
            where: { is_project: true },
            select: { name: true, project_phase: true }
        })
        console.log('Projects:', JSON.stringify(projects, null, 2))
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
