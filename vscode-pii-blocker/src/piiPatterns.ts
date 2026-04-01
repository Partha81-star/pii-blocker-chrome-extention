/**
 * PII Patterns and Detection Logic
 * Extracted from browser extension with VS Code enhancements
 */

export interface PIIDetectionResult {
    isSafe: boolean;
    matchesFound: string[];
    detailsPerType: Map<string, Array<{ text: string; range: [number, number] }>>;
}

export const SENSITIVE_PATTERNS = {
    creditCard: /\b(?:\d[ -]*?){13,16}\b/g,
    awsKey: /AKIA[0-9A-Z]{16}/g,
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    proprietaryMarkers: /(INTERNAL_ONLY|CONFIDENTIAL|PROPERTY_OF_ACME|DO_NOT_DISTRIBUTE)/gi,
    dbConnection: /(mongodb\+srv|postgres|mysql):\/\/[^\s]+/gi,
    highEntropySecret: /\b(?=[A-Za-z0-9_\/+\-=]{32,128}\b)(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z0-9_\/+\-=]{32,128}\b/g,
};

/**
 * Scan text for all sensitive patterns
 * @param text The text to scan
 * @returns Detection result with matches found
 */
export function scanForPII(text: string): PIIDetectionResult {
    const matchesFound: string[] = [];
    const detailsPerType = new Map<string, Array<{ text: string; range: [number, number] }>>();

    for (const [type, pattern] of Object.entries(SENSITIVE_PATTERNS)) {
        pattern.lastIndex = 0; // Reset regex state
        
        let match;
        const matches: Array<{ text: string; range: [number, number] }> = [];
        
        while ((match = pattern.exec(text)) !== null) {
            matches.push({
                text: match[0],
                range: [match.index, match.index + match[0].length],
            });
        }

        if (matches.length > 0) {
            matchesFound.push(type);
            detailsPerType.set(type, matches);
        }
    }

    return {
        isSafe: matchesFound.length === 0,
        matchesFound,
        detailsPerType,
    };
}

/**
 * Get all ranges for decorating sensitive text
 * @param text The text to analyze
 * @returns Array of ranges to decorate
 */
export function getPIIRanges(text: string): Array<{ range: [number, number]; type: string }> {
    const ranges: Array<{ range: [number, number]; type: string }> = [];
    const result = scanForPII(text);

    for (const [type, matches] of result.detailsPerType) {
        for (const match of matches) {
            ranges.push({
                range: match.range,
                type,
            });
        }
    }

    return ranges;
}

/**
 * Redact sensitive data with placeholders
 * @param text The text to redact
 * @returns Redacted text
 */
export function redactSensitiveData(text: string): string {
    let redactedText = text;
    const result = scanForPII(text);

    // Sort by position in reverse to avoid offset issues
    const allMatches: Array<{ position: number; length: number; type: string }> = [];
    
    for (const [type, matches] of result.detailsPerType) {
        for (const match of matches) {
            allMatches.push({
                position: match.range[0],
                length: match.range[1] - match.range[0],
                type,
            });
        }
    }

    // Sort in reverse order by position
    allMatches.sort((a, b) => b.position - a.position);

    // Replace from end to start to avoid offset issues
    for (const match of allMatches) {
        const before = redactedText.substring(0, match.position);
        const after = redactedText.substring(match.position + match.length);
        redactedText = before + `[REDACTED_${match.type.toUpperCase()}]` + after;
    }

    return redactedText;
}
