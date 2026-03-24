// Younium brand-inspired color palette
export const PROJECT_COLORS = [
  "#54B6BE", // younium teal
  "#E8655A", // younium coral
  "#F5B731", // younium amber
  "#1DB8C4", // younium bright teal
  "#7C6FD4", // purple
  "#4CAF50", // green
  "#FF7043", // deep orange
  "#42A5F5", // light blue
  "#EC407A", // pink
  "#26A69A", // teal variant
];

export function getNextColor(usedColors: string[]): string {
  const available = PROJECT_COLORS.filter((c) => !usedColors.includes(c));
  return available.length > 0
    ? available[0]
    : PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];
}
