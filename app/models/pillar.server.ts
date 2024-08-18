// app/models/pillar.server.ts

import { prisma } from '#app/utils/db.server.ts'

export async function getPillars(buildingId?: string) {
  const where = buildingId ? { buildingId } : {};
  return prisma.pillar.findMany({
    where,
    select: { 
      id: true, 
      name: true, 
      weight: true, 
      score: true, 
      buildingId: true,
      kpis: {
        select: {
          currentValue: true
        }
      }
    },
  });
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
