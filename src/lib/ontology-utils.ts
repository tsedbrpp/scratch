export const getColorForCategory = (category: string) => {
    const lower = category.toLowerCase();
    // Using lighter pastel shades (300/400) for better text readability
    if (lower.includes('core') || lower.includes('concept')) return "#fca5a5"; // Red-300
    if (lower.includes('mechanism')) return "#d8b4fe"; // Purple-300
    if (lower.includes('actor')) return "#93c5fd"; // Blue-300
    if (lower.includes('value') || lower.includes('resource')) return "#86efac"; // Green-300
    if (lower.includes('methodology')) return "#fdba74"; // Orange-300
    return "#cbd5e1"; // Slate-300
};
