
import fs from 'fs';

const CONSTANTS_PATH = 'constants.ts';
const NEW_WORDS_PATH = 'scripts/new_words.json';

function main() {
    const constantsContent = fs.readFileSync(CONSTANTS_PATH, 'utf8');
    const newWords = JSON.parse(fs.readFileSync(NEW_WORDS_PATH, 'utf8'));

    // Format new words as TS array items
    const newLines = newWords.map(item => {
        // Escape quotes in definition if any
        const def = item.definition.replace(/"/g, '\\"');
        const word = item.word.replace(/"/g, '\\"');
        return `  { id: ${item.id}, word: "${word}", definition: "${def}" }`;
    }).join(',\n');

    // Find the end of the array
    // We look for the last closing bracket `];`
    const lastBracketIndex = constantsContent.lastIndexOf('];');

    if (lastBracketIndex === -1) {
        console.error("Could not find closing bracket '];' in constants.ts");
        process.exit(1);
    }

    // Check if the previous item has a comma
    // Scan backwards from lastBracketIndex ignoring whitespace/newlines
    let i = lastBracketIndex - 1;
    while (i >= 0 && /\s/.test(constantsContent[i])) {
        i--;
    }

    const needsComma = constantsContent[i] !== ',' && constantsContent[i] !== '['; // if array is empty (starts with [), no comma needed.

    const insertion = (needsComma ? ',\n' : '\n') + newLines + '\n';

    const newContent = constantsContent.slice(0, lastBracketIndex) + insertion + constantsContent.slice(lastBracketIndex);

    fs.writeFileSync(CONSTANTS_PATH, newContent);
    console.log(`Appended ${newWords.length} words to constants.ts`);
}

main();
