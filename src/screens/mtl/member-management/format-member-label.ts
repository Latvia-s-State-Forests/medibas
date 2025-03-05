export function formatMemberLabel(
    cardNumber: string | undefined,
    firstName: string | undefined,
    lastName: string | undefined
): string {
    const parts: string[] = [];
    if (firstName) {
        parts.push(firstName);
    }
    if (lastName) {
        parts.push(lastName);
    }
    if (cardNumber) {
        parts.push(cardNumber);
    }
    return parts.join(" ");
}
