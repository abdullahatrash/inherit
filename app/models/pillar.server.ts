import { prisma } from '#app/utils/db.server.ts'

export async function getPillars() {
    const pillars = await prisma.pillar.findMany({
      select: { id: true, name: true, weight: true, score: true },
    });
    console.log("Pillars fetched from database:", pillars);
    return pillars;
  }
  export async function getPillarWithKPIs(pillarId: string) {
    return prisma.pillar.findUnique({
      where: { id: pillarId },
      include: {
        kpis: {
          select: {
            id: true,
            name: true,
            currentValue: true,
            targetValue: true,
            positiveContribution: true,
            weight: true,
          },
        },
      },
    })
  }
  
