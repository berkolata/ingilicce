
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const CONSTANTS_PATH = 'constants.ts';
const PDF_PATH = 'pdf-1500-vocabulary-words_compress.pdf';
const OUTPUT_PATH = 'scripts/new_words.json';

// Helper to normalize strings for comparison
const normalize = (s) => s.trim().toLowerCase();

async function main() {
    // 1. Read existing constants.ts
    console.log('Reading constants.ts...');
    const constantsContent = fs.readFileSync(CONSTANTS_PATH, 'utf8');

    // Extract existing words and max ID
    const existingWords = new Set();
    let maxId = 0;

    // Regex to capture id and word from lines like: { id: 1, word: "Abhor", definition: "hate" },
    const entryRegex = /id:\s*(\d+),\s*word:\s*"([^"]+)"/g;
    let match;

    while ((match = entryRegex.exec(constantsContent)) !== null) {
        const id = parseInt(match[1], 10);
        const word = match[2];

        if (id > maxId) maxId = id;
        existingWords.add(normalize(word));
    }

    console.log(`Found ${existingWords.size} existing words. Max ID: ${maxId}`);

    // 2. Read PDF
    console.log('Reading PDF...');
    const dataBuffer = fs.readFileSync(PDF_PATH);
    const pdfData = await pdf(dataBuffer);
    const text = pdfData.text;

    // 3. Parse PDF Text
    // Format: "Number. Word, Definition"
    // We split by lines starting with number
    // Regex looks for "newline + number + dot + space"

    const newEntries = [];

    // We'll process line by line or chunk by chunk
    // A clean way is to split by the pattern `\n\d+\.\s`
    // However, the first item might be at start of string without \n

    // Replace newlines with spaces to handle wrapped lines, BUT we need to preserve the distinction of items.
    // Better strategy:
    // Identify all indices where an item starts.

    const itemStartRegex = /(?:^|\n)(\d+)\.\s+/g;
    const itemStarts = [];
    while ((match = itemStartRegex.exec(text)) !== null) {
        itemStarts.push({
            index: match.index,
            number: parseInt(match[1], 10),
            fullMatch: match[0]
        });
    }

    console.log(`Found ${itemStarts.length} potential items in PDF.`);

    for (let i = 0; i < itemStarts.length; i++) {
        const start = itemStarts[i];
        const nextStart = itemStarts[i + 1];

        const contentStartIndex = start.index + start.fullMatch.length;
        const endIndex = nextStart ? nextStart.index : text.length;

        let chunk = text.substring(contentStartIndex, endIndex).trim();

        // Remove footer noise if present (e.g. http links at end of page)
        // Usually these appear before the next number.
        // Simple heuristic: if chunk contains "http://", cut it off
        const httpIndex = chunk.indexOf('http://');
        if (httpIndex !== -1) {
            chunk = chunk.substring(0, httpIndex).trim();
        }

        // Split Word and Definition
        // "Abhor, hate" -> Word: Abhor, Def: hate
        const firstComma = chunk.indexOf(',');
        if (firstComma === -1) {
            // console.warn(`Skipping item ${start.number}: No comma found in "${chunk.substring(0, 20)}..."`);
            continue;
        }

        const wordRaw = chunk.substring(0, firstComma).trim();
        let defRaw = chunk.substring(firstComma + 1).trim();

        // Clean up newlines in definition
        defRaw = defRaw.replace(/\s+/g, ' ');

        // Check uniqueness
        if (!existingWords.has(normalize(wordRaw))) {
            // Double check it's not a noise word
            if (wordRaw.length < 2 || wordRaw.length > 50) continue;

            maxId++;
            newEntries.push({
                id: maxId,
                word: wordRaw,
                definition: defRaw
            });

            existingWords.add(normalize(wordRaw)); // Add to set to prevent dupes within PDF
        }
    }

    console.log(`Identified ${newEntries.length} new unique words.`);

    // 4. Output
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(newEntries, null, 2));
    console.log(`Written to ${OUTPUT_PATH}`);
}

main().catch(err => console.error(err));
