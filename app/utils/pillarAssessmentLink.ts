type Pillar = {
    id: string;
    name: string;
    weight: number;
    score: number;
    buildingId: string;
    kpis: Array<{ currentValue: number }>;
  };
  

export const getPillarAssessmentLink = (pillar: Pillar, buildingId : string) => {
    switch(pillar.name) {
      case "Energy Performance":
        return `/assessment/energy-performance?buildingId=${buildingId}`;
      case "Resource Efficiency":
        return `/assessment/resource-efficiency?buildingId=${buildingId}`;
      case "Climate Resilience":
        return `/assessment/resilience?buildingId=${buildingId}`;
      case "Accessibility":
        return `/assessment/accessibility?buildingId=${buildingId}`;
      default:
        return `/assessment/${pillar.id}?buildingId=${buildingId}`;
    }
  };
