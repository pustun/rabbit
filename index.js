const fs = require('fs');
const md5 = require('md5');

const originalPhrase = 'poultry outwits ants';

const originalPhraseWithoutSpaces = originalPhrase.replace(/\s/g, '');

const patternToMatch = sortString(originalPhraseWithoutSpaces); 

const keyHashes = [
    'e4820b45d2277f3844eac66c903e84be',
    '23170acc097c24edb98fc5488ab033fe',
    '665e5bcb0c20062fe8abaaf4628bb154'
];

function sortString(str) {
    return str.split('')
              .sort()
              .join('');
}

function readDitionary() {
    return new Promise((resolve, reject) => {

        fs.readFile('words.txt', 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });

    });
}

function splitInLines(str) {
    const splitRegex = /(\n|\r\n)/;

    return str.split(splitRegex);
}


function filterUnrelated(data) {
    const charsInOriginalPrase =
        originalPhrase
            .split('')
            .filter(x => x !== ' ')
            .reduce((acc, x) => {
                if (!acc[x]) {
                    acc[x] = true;
                }

                return acc;
            }, {});

    return data.filter(word => {
        const wordChars = word.split('');

        return wordChars.every(char => charsInOriginalPrase[char]);
    });
}

function groupWords(data) {
    return data
            .reduce((acc, x) => {
                if (!acc[x.length]) {
                    acc[x.length] = [];
                }
                acc[x.length].push(x);

                return acc;
            }, {});
}

function createPossibleIndexCombinations(targetSum, minValue, count) {
    if (count === 1) return [[targetSum]];

    const upperLimit = targetSum - minValue*(count - 1);

    const result = [];

    for(let i = minValue; i <= upperLimit; i++) {
        const subResult = createPossibleIndexCombinations(
                                targetSum - i,
                                minValue,
                                count - 1);
        subResult.forEach(x => result.push([i, ...x]));
    }

    return result;
}

function combineWords(indexes, patternToMatch) {
    return (dict) => {
        const result = [];

        indexes.forEach((indexCollection, position) => {

            console.log(`${position + 1} out of ${indexes.length}`)

            const [m, n, k] = indexCollection;

            if (!dict[m] || !dict[n] || !dict[k]) return;

            for(let i = 0; i < dict[m].length; i++) {
                for (let j = 0; j < dict[n].length; j++) {
                    for(let g = 0;g < dict[k].length; g++) {

                        const firstWord = dict[m][i];
                        const secondWord = dict[n][j];
                        const thrirdWord = dict[k][g];

                        const phraseToMatch = firstWord + secondWord + thrirdWord;

                        if (sortString(phraseToMatch) === patternToMatch) {
                            result.push([firstWord, secondWord, thrirdWord]);
                        }
                    }
                }
            }

        });

        return result;
    };
}

function searchForTheAnswer(wordCombinations) {
    wordCombinations.forEach(x => {
        const phrase = x.join(' ');
        const phraseHash = md5(phrase);

        if (keyHashes.includes(phraseHash)) {
            console.log(phrase);
        }
    })
}

const targetSum = originalPhrase
                    .split('')
                    .filter(x => x !== ' ')
                    .reduce((acc, x) => ++acc, 0);

const minWordLength = 1;
const wordsInSentens = 3;                 

const indexCombinations = createPossibleIndexCombinations(
                                targetSum,
                                minWordLength,
                                wordsInSentens);

readDitionary()
    .then(splitInLines)
    .then(filterUnrelated)
    .then(groupWords)
    .then(combineWords(indexCombinations, patternToMatch))
    .then(searchForTheAnswer);