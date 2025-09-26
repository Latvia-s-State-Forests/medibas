/**
 * Formats hunt statistics in the format: "X of Y (Z%)"
 * @param count - Number of hunts in this category
 * @param total - Total number of hunts
 * @returns Formatted string like "8 (14%)"
 */
export function formatHuntStatistics(count: number, total: number): string {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return `${count} (${percentage}%)`;
}
