import { prisma } from '#app/utils/db.server.ts'

export async function calculatePillarScore(pillarId: string, kpiValues: Record<string, number>) {
    const pillar = await prisma.pillar.findUnique({
      where: { id: pillarId },
      include: { kpis: true },
    })
  
    if (!pillar) throw new Error("Pillar not found")
  
    let totalScore = 0
  
    for (const kpi of pillar.kpis) {
      const currentValue = kpiValues[kpi.id] || kpi.currentValue
      const achievement = kpi.positiveContribution
        ? (currentValue / kpi.targetValue) * 100
        : (kpi.targetValue / currentValue) * 100
      const score = (achievement / 100) * kpi.weight * (pillar.weight / 100)
      totalScore += score
  
      await prisma.kPI.update({
        where: { id: kpi.id },
        data: { currentValue, score },
      })
    }
  
    await prisma.pillar.update({
      where: { id: pillarId },
      data: { score: totalScore },
    })
  
    return totalScore
  }
  