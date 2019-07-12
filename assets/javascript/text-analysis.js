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
        return new Promise(async function(resolve, reject) {
            let data = JSON.stringify({id: movieID});
            let sendCall = firebase.functions().httpsCallable("getKeywords");
            let keywords
            sendCall(data).then(function(result) {
                keywords = result.data
                console.log(keywords)
                resolve(keywords);
            });
        })
    },
    getMovieID(movieTitle, movieYear) {
        return new Promise(function (resolve, reject) {
            let data = JSON.stringify({ title: movieTitle, year: movieYear });
            let sendCall = firebase.functions().httpsCallable("getMovieID");
            let movieID
            sendCall(data).then(function (result) {
                movieID = result.data
                console.log(movieID)
                resolve(movieID);
            });
        })
    },
    getMoviesByGenre: async function(genreID) {
        return new Promise(async function (resolve, reject) {
            let titles = [];
            for (let i = 1; i <= 2; i++) {
                let data = JSON.stringify({ id: genreID, page: i });
                let sendCall = firebase.functions().httpsCallable("getMoviesByGenre");
                let titlesToConcat
                await sendCall(data).then(function(result) {
                    titlesToConcat = result.data;
                    titles = titles.concat(titlesToConcat);
                })
            }
            resolve(titles)
        })
    }
}

async function findTopThreeMovies(genreIdArray, userInput) {
    return new Promise(async function (resolve, reject) {
        let movies = await TMDB.getMoviesByGenre(genreIdArray[0]);
        for (let i = 1; i < genreIdArray.length; i++) {
            movies = await movies.concat(TMDB.getMoviesByGenre(genreIdArray[1]));
        }
        for (let j = 0; j < movies.length; j++) {
            let keywordsRaw = await TMDB.getKeywords(movies[j].id);
            let keywords = TextAnalysis.parseKeywords(keywordsRaw);
            let wordArrayOne = await TextAnalysis.getSimilarWords(keywords);
            let parsedTextObject = await TextAnalysis.parseText(userInput)
            let input = parsedTextObject.adjectives.concat(parsedTextObject.nouns, parsedTextObject.places);
            let wordArrayTwo = await TextAnalysis.getSimilarWords(input);
            movies[j].score = scoreWordArrayByWordArray(wordArrayOne, wordArrayTwo);
        }
        movies.sort(function(a, b) {
            return b.score - a.score;
        })
        let topThreeTitles = [movies[0].title, movies[1].title, movies[2].title]
        resolve(topThreeTitles);
    })
}

