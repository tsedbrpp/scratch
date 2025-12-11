
// Mock Fuzzy Match Logic from analysis-utils.ts
const normalize = (s) => s.toLowerCase().replace(/\s+/g, ' ').replace(/[^\w ]/g, '').trim();

const checkFuzzyMatch = (quote, source) => {
    const nQuote = normalize(quote);
    const normalizedText = normalize(source);

    console.log("Normalized Quote:", nQuote);
    console.log("Normalized Source:", normalizedText);

    // Direct match attempt
    if (normalizedText.includes(nQuote)) {
        console.log("Direct match found");
        return true;
    }

    // Ellipsis handling
    const parts = quote.split(/\.\.\.|…/);
    console.log("Split Parts:", parts);

    if (parts.length > 1) {
        let lastIndex = 0;
        const allFound = parts.every(part => {
            if (!part || part.length < 3) return true; // Skip excessively short fragments
            const nPart = normalize(part);
            const index = normalizedText.indexOf(nPart, lastIndex);
            console.log(`Looking for part: "${nPart}" after index ${lastIndex}. Found at: ${index}`);
            if (index !== -1) {
                lastIndex = index + nPart.length;
                return true;
            }
            return false;
        });
        return allFound;
    }
    return false;
};

// Test Case 1: Ellipsis
const quote1 = "The project has a dual objective...establishes rights to protect the most vulnerable party.";
const source1 = "The project has a dual objective. It establishes rights to protect the most vulnerable party.";
console.log("TEST 1 Result:", checkFuzzyMatch(quote1, source1));

// Test Case 2: No Ellipsis, likely missing punctuation in regex?
// "risk-based" -> normalized "riskbased"
// User reported: "The proposal establishes risk-based regulation and a rights-based regulatory model."
const quote2 = "The proposal establishes risk-based regulation and a rights-based regulatory model.";
const source2 = "The proposal establishes risk-based regulation and a rights-based regulatory model.";
console.log("TEST 2 Result:", checkFuzzyMatch(quote2, source2));

// Test Case 3: Mixed content
const quote3 = "The Executive Branch will designate the competent authority";
const source3 = "The Executive Branch will designate the competent authority to oversee...";
console.log("TEST 3 Result:", checkFuzzyMatch(quote3, source3));
