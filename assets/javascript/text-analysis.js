var testString = "I want a movie about a group of unlikely friends singing in high school"

var testString2 = "I'm looking for a very action heavy fighting movie with fast cars and with big punches and strong criminals looking angry specifically in New Mexico."

var apiKey = "c07a02e77846bc61b3a6ece1fabeeee2"
var notebookID = "11036"

var TextAnalysis = {
    parseText(string) {
        let textObject = nlp(string);
        let parsedTextObject = {
            people: textObject.people().out("array"),
            adjectives: textObject.adjectives().out("array"),
            places: textObject.places().out("array"),
            nouns: textObject.nouns().toSingular().out("array")
        }
        console.log(parsedTextObject)
        return parsedTextObject;
    },
    getSimilarWords(inputWordArray) {
        return new Promise(function(resolve, reject) {
            var outputWordArray = [];
            for (let word of inputWordArray) {
                outputWordArray.push([word, 2])
                var maxscore
                $.ajax({
                    url: "https://api.datamuse.com/words?ml="+word+"&topics=movie",
                    method: "GET"
                }).then(function(response) {
                    for (let i = 0; i < response.length; i++) {
                        let item = response[i]
                        if (i === 0) {
                            maxscore = item.score
                        }
                        let score = item.score/maxscore
                        if (score > 0) {
                            outputWordArray.push([item.word, score])
                        }
                    }
                })
            }
            console.log(outputWordArray)
            resolve(outputWordArray);
        })
    },
    scoreStringByWordArray(string, wordArray) {
        var score = 0;
        for (let word of wordArray) {
            let wordRegEx = new RegExp(word[0], "g");
            let count = (string.match(wordRegEx) || []).length;
            score += count * word[1];
        }
        score = score / (string.split(" ").length)
        console.log(score)
        return score;
    },
    scoreStringByString(string, stringToScore, isScoringNouns, isScoringAdjectives) {
        let parsedTextObject = this.parseText(string);
        let inputWordArray = [];
        if (isScoringNouns) {
            for (let noun of parsedTextObject.nouns) {
                inputWordArray.push(noun);
            }
        }
        if (isScoringAdjectives) {
            for (let adjective of parsedTextObject.adjectives) {
                inputWordArray.push(adjective);
            }
        }
        let wordArray = this.getSimilarWords(inputWordArray);
        let score = this.scoreStringByWordArray(stringToScore, wordArray);
        return score;
    },
    scoreWordArrayByWordArray(wordArrayOne, wordArrayTwo) {
        let wordsOne = [];
        let scoresOne = [];
        let wordsTwo = [];
        let scoresTwo = [];
        var score = 0;
        for (let wordDuo of wordArrayOne) {
            wordsOne.push(wordDuo[0]);
            scoresOne.push(wordDuo[1]);
        }
        for (let wordDuo of wordArrayTwo) {
            wordsTwo.push(wordDuo[0]);
            scoresTwo.push(wordDuo[1]);
        }
        for (let oneIndex = 0; oneIndex < wordsOne.length; oneIndex++) {
            let twoIndex = wordsTwo.indexOf(wordsOne[oneIndex]);
            if (twoIndex > -1) {
                score = score + scoresOne[oneIndex] + scoresTwo[twoIndex]
                wordsTwo.splice(twoIndex, 1);
                scoresTwo.splice(twoIndex, 1);
            }
        }
        for (let twoIndex = 0; twoIndex < wordsOne.length; twoIndex++) {
            let oneIndex = wordsOne.indexOf(wordsTwo[twoIndex]);
            if (oneIndex > -1) {
                score = score + scoresOne[oneIndex] + scoresTwo[twoIndex]
                wordsOne.splice(oneIndex, 1);
                scoresOne.splice(oneIndex, 1);
            }
        }
        return score;
    },
    parseKeywords(keywords) {
        var keywordsParsed = []
        for (let keyword of keywords) {
            let parsedKeywordObject = this.parseText(keyword);
            keywordsParsed = keywordsParsed.concat(parsedKeywordObject.adjectives, parsedKeywordObject.nouns, parsedKeywordObject.places);
        }
        console.log(keywordsParsed)
        return keywordsParsed;
    }
}

var TMDB = {
    getKeywords(movieID) {
        return new Promise(function(resolve, reject) {
            var keywords = []
            var settings = {
                "url": "https://api.themoviedb.org/3/movie/" + movieID + "/keywords?api_key=" + apiKey,
                "method": "GET",
              }  
            $.ajax(settings).done(function (response) {
                let results = response.keywords;
                for (let result of results) {
                    keywords.push(result.name)
                }
                console.log(keywords)
                resolve(keywords)
            });
        })
        },
    getMovieID(movieTitle, movieYear) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                "url": "https://api.themoviedb.org/3/search/movie?api_key=" + apiKey + "&language=en-US&query=" + movieTitle + "&page=1&include_adult=false&year=" + movieYear,
                "method": "GET"
            }).done(function(response) {
                console.log(response)
                let results = response.results;
                let firstResult = results[0];
                console.log(firstResult.id)
                resolve(firstResult.id);
            })
        })
    }
}

async function checkAMovie() {
    let movieID = await TMDB.getMovieID("High School Musical", 2006);
    let keywordsRaw = await TMDB.getKeywords(movieID);
    let keywords = TextAnalysis.parseKeywords(keywordsRaw);
    let wordArrayOne = await TextAnalysis.getSimilarWords(keywords);
    let parsedTextObject = await TextAnalysis.parseText(testString)
    let input = parsedTextObject.adjectives.concat(parsedTextObject.nouns, parsedTextObject.places);
    console.log(input)
    let wordArrayTwo = await TextAnalysis.getSimilarWords(input)
    console.log(TextAnalysis.scoreWordArrayByWordArray(wordArrayOne, wordArrayTwo))
}