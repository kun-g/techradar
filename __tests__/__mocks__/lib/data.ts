export const ringRatios = [0.4, 0.3, 0.2, 0.1];

export async function fetchRadarData() {
  return {
    quadrants: [
      { id: "languages", name: "Languages & Frameworks", order: 0 },
      { id: "platforms", name: "Platforms", order: 1 },
      { id: "tools", name: "Tools", order: 2 },
      { id: "techniques", name: "Techniques", order: 3 },
    ],
    rings: [
      { id: "adopt", name: "Adopt", order: 0, color: "green", stroke: "rgba(16, 185, 129, 0.7)" },
      { id: "trial", name: "Trial", order: 1, color: "blue", stroke: "rgba(59, 130, 246, 0.7)" },
      { id: "assess", name: "Assess", order: 2, color: "yellow", stroke: "rgba(234, 179, 8, 0.7)" },
      { id: "hold", name: "Hold", order: 3, color: "red", stroke: "rgba(239, 68, 68, 0.7)" },
    ],
    blips: [
      {
        id: "1-techniques",
        name: "Four key metrics",
        quadrant: "techniques",
        ring: "adopt",
        description: "Test description",
      },
      {
        id: "2-languages",
        name: "TypeScript",
        quadrant: "languages",
        ring: "adopt",
        description: "Test description",
      },
    ],
  };
} 