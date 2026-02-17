
/**
 * Alphanumeric Luhn Algorithm (Mod 36)
 * Used to validate evaluator codes similar to credit card validation.
 * 
 * Character Set: 0-9, A-Z (Case insensitive)
 */

const CODE_POINTS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Map character to its value
function getCodePoint(char: string): number {
    const uc = char.toUpperCase();
    const index = CODE_POINTS.indexOf(uc);
    if (index === -1) throw new Error(`Invalid character: ${char}`);
    return index;
}

// Calculate the checksum
export function generateCheckCharacter(input: string): string {
    let factor = 2;
    let sum = 0;
    const n = CODE_POINTS.length;

    // Process from right to left
    for (let i = input.length - 1; i >= 0; i--) {
        const codePoint = getCodePoint(input[i]);
        let addend = codePoint * factor;

        // If product has two "digits" (in base 36), sum them
        // In Luhn mod N, this is equivalent to: addend = Math.floor(addend / n) + (addend % n);
        addend = Math.floor(addend / n) + (addend % n);

        sum += addend;
        factor = factor === 2 ? 1 : 2;
    }

    const remainder = sum % n;
    const checkCodePoint = (n - remainder) % n;
    return CODE_POINTS[checkCodePoint];
}

export function validateEvaluatorCode(code: string): boolean {
    // Sanitize
    const cleanCode = code.trim().toUpperCase().replace(/[^0-9A-Z]/g, ''); // Remove dashes/spaces for calculation?
    // Actually, usually headers like "EVAL-" are ignored or part of it. 
    // Let's assume the user enters "G-NODE-01X" where 'X' is check digit.
    // Or we simply validate the whole alphanumeric string ignoring hyphens.

    if (cleanCode.length < 2) return false;

    let factor = 1;
    let sum = 0;
    const n = CODE_POINTS.length;

    // Process from right to left (check digit is included)
    for (let i = cleanCode.length - 1; i >= 0; i--) {
        const codePoint = CODE_POINTS.indexOf(cleanCode[i]);
        if (codePoint === -1) return false; // Invalid char

        let addend = codePoint * factor;
        addend = Math.floor(addend / n) + (addend % n);

        sum += addend;
        factor = factor === 2 ? 1 : 2;
    }

    return sum % n === 0;
}

// Helper to generate a valid code for testing/distribution
export function generateValidCode(prefix: string): string {
    const cleanPrefix = prefix.trim().toUpperCase().replace(/[^0-9A-Z]/g, '');
    const checkChar = generateCheckCharacter(cleanPrefix);
    return `${prefix}${checkChar}`;
}
