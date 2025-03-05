export function getSortedItems(items: string[]): string[] {
    return [...items].sort((a, b) => a.localeCompare(b));
}
