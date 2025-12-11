
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('pdf-1500-vocabulary-words_compress.pdf');

pdf(dataBuffer).then(function (data) {
    console.log("Number of pages:", data.numpages);
    console.log("First 3000 chars of text content:");
    console.log(data.text.substring(0, 3000));
}).catch(err => {
    console.error("Error parsing PDF:", err);
});
