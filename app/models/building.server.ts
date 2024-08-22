import { prisma } from "#app/utils/db.server.js"

export async function createDefaultPillarsForBuilding(buildingId: string) {
    const defaultPillars = [
      { name: 'Energy Performance', weight: 25 },
      { name: 'Resource Efficiency', weight: 25 },
      { name: 'Climate Resilience', weight: 25 },
      { name: 'Accessibility', weight: 25 },
    ]
  
    for (const pillar of defaultPillars) {
      await prisma.pillar.create({
        data: {
          ...pillar,
          score: 0,
          building: { connect: { id: buildingId } },
          kpis: {
            create: [] // You can add default KPIs here if needed
          }
        },
      })
    }
  }
