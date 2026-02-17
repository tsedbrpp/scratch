
const CODE_POINTS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function getCodePoint(char) {
    const uc = char.toUpperCase();
    const index = CODE_POINTS.indexOf(uc);
    if (index === -1) throw new Error(`Invalid character: ${char}`);
    return index;
}

function generateCheckCharacter(input) {
    let factor = 2;
    let sum = 0;
    const n = CODE_POINTS.length;

    // Process from right to left
    for (let i = input.length - 1; i >= 0; i--) {
        const codePoint = getCodePoint(input[i]);
        let addend = codePoint * factor;

        // If product has two "digits" (in base 36), sum them
        addend = Math.floor(addend / n) + (addend % n);

        sum += addend;
        factor = factor === 2 ? 1 : 2;
    }

    const remainder = sum % n;
    const checkCodePoint = (n - remainder) % n;
    return CODE_POINTS[checkCodePoint];
}

function generateValidCode(prefix) {
    const cleanPrefix = prefix.trim().toUpperCase().replace(/[^0-9A-Z]/g, '');
    const checkChar = generateCheckCharacter(cleanPrefix);
    return `${prefix}${checkChar}`; // Append check char to original prefix (with dash if wanted, but check char is calculated on clean)
}

const prefixes = [
    "G-NODE-21",
    "G-NODE-22",
    "G-NODE-23",
    "G-NODE-24",
    "G-NODE-25"
];

console.log("Generated Codes:");
prefixes.forEach(p => {
    // calculate check digit on "GNODE21"
    const clean = p.replace(/-/g, '');
    const check = generateCheckCharacter(clean);
    console.log(`${p}${check}`);
});
