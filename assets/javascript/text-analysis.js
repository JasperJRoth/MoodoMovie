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

var genres = [
    {
        "id": 28,
        "name": "Action",
        "wordArray": ['action', 'police', 'army', 'fight', 'shoot', 'punch', 'kick', 'die', 'kill', 'tough', 'strong', 'angry']
    },
    {
        "id": 12,
        "name": "Adventure",
        "wordArray": ['fun', 'travel', 'action', 'adventure', 'swashbuckling', 'treasure', 'villain', 'happy']
    },
    {
        "id": 16,
        "name": "Animation",
        "wordArray": ['animation', 'children', 'nostalgia', 'fun', 'disney', 'pixar', 'fairy tale', 'happy']
    },
    {
        "id": 35,
        "name": "Comedy",
        "wordArray": ['laugh', 'comedy', 'fun', 'happy', 'joke', 'irreverant', 'dumb']
    },
    {
        "id": 80,
        "name": "Crime",
        "wordArray": ['police', 'law', 'crime', 'robbery', 'murder', 'tough', 'action', 'criminal', 'gangster']
    },
    {
        "id": 99,
        "name": "Documentary",
        "wordArray": ["documentary", "non-fiction", 'real world', 'people', 'story', 'history']
    },
    {
        "id": 18,
        "name": "Drama",
        "wordArray": ['sad', 'drama', 'serious', 'family', 'love', 'angry', 'bittersweet', 'prestige', 'awards']
    },
    {
        "id": 10751,
        "name": "Family",
        "wordArray": ['family', 'children', 'fun', 'young', 'happy', 'animation']
    },
    {
        "id": 14,
        "name": "Fantasy",
        "wordArray": ['fantasy', 'magic', 'knight', 'dragon', 'speculative', 'fun', 'dramatic', 'adventure']
    },
    {
        "id": 36,
        "name": "History",
        "wordArray":  ['history', 'real world', 'non-fiction', 'prestige', 'awards', 'drama']
    },
    {
        "id": 27,
        "name": "Horror",
        "wordArray": ['scary', 'spooky', 'monster', 'death', 'horror', 'darkness']
    },
    {
        "id": 10402,
        "name": "Music",
        "wordArray": ["music", 'band', 'song', 'happy', 'disney', 'fun', 'dance']
    },
    {
        "id": 9648,
        "name": "Mystery",
        "wordArray": ['mystery', 'detective', 'clues', 'murder', 'sherlock holmes', 'deduction', 'crime', 'drama', 'comedy']
    },
    {
        "id": 10749,
        "name": "Romance",
        "wordArray": ['romance', 'love', 'sad', 'happy', 'sex', 'marraige', 'meet cute']
    },
    {
        "id": 878,
        "name": "Science Fiction",
        "wordArray": ['science', 'science fiction', 'robot', 'space', 'fantasy', 'future', 'technology', 'speculative']
    },
    {
        "id": 53,
        "name": "Thriller",
        "wordArray": ['thriller', 'exciting', 'drama', 'serious', 'horror', 'cerebral']
    },
    {
        "id": 10752,
        "name": "War",
        "wordArray": ['war', 'history', 'army', 'soldier', 'non-fiction', 'marines', 'navy', 'world war']
    },
    {
        "id": 37,
        "name": "Western",
        "wordArray": ['western', 'cowboy', 'sharpshooter', 'wild west', 'sherrif', 'native american', 'mexican']
    }
]

async function findRelevantGenres(userInput) {
    return new Promise(async function(resolve, reject) {
        let genresList = genres;
        let parsedTextObject = await TextAnalysis.parseText(userInput)
        let input = parsedTextObject.adjectives.concat(parsedTextObject.nouns, parsedTextObject.places);
        let wordArrayTwo = await TextAnalysis.getSimilarWords(input);
        for (let i = 0; i < genresList.length; i++) {
            genresList[i].wordArray = await TextAnalysis.getSimilarWords(genresList[i].wordArray)
            genresList[i].score = TextAnalysis.scoreWordArrayByWordArray(genresList[i].wordArray, wordArrayTwo)
        }
        genresList.sort(function (a, b) {
            return b.score - a.score;
        })
        console.log(genresList)
        let topThreeGenres = [genresList[0], genresList[1], genresList[2]]
        resolve(topThreeGenres);
    })
}

var TMDB = {
    getKeywords(movieID) {
        return new Promise(async function(resolve, reject) {
            if (movieID) {
                let data = {id: movieID};
                console.log(data)
                let sendCall = firebase.functions().httpsCallable("getKeywords");
                let keywords
                sendCall(data).then(function(result) {
                    keywords = result.data
                    console.log(keywords)
                    resolve(keywords);
                });
            }
            else {
                resolve(false);
            }
        })
    },
    getMoviesByGenre: async function(genreID) {
        return new Promise(async function (resolve, reject) {
            let titles = [];
            for (let i = 1; i <= 2; i++) {
                let data = { id: genreID, page: i };
                console.log(data)
                let sendCall = firebase.functions().httpsCallable("getMoviesByGenre");
                let titlesToConcat
                // titles = titles.concat(titlesToConcat);
                await sendCall(data).then(function(result) {
                    console.log(result)
                    titlesToConcat = result.data;
                    titles = titles.concat(titlesToConcat);
                })
            }
            console.log(titles)
            // document.write(JSON.stringify(titles))
            resolve(titles)
        })
    }
}

// function getMoviesByGenre(data) {
//     return new Promise(function (resolve, reject) {
//         var dataParsed = JSON.parse(data);
//         var genreID = dataParsed.id;
//         var page = dataParsed.page;
//         var apiKey = "c07a02e77846bc61b3a6ece1fabeeee2";
//         var movies = []
//         var url = "https://api.themoviedb.org/3/discover/movie?api_key=" + apiKey + "&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=" + page + "&primary_release_date.lte=2018-07-10&vote_average.gte=6&with_genres=" + genreID
//         var xhttp = new XMLHttpRequest;
//         xhttp.onreadystatechange = function () {
//             if (this.readyState == 4 && this.status == 200) {
//                 let results = JSON.parse(xhttp.responseText).results;
//                 console.log(results)
//                 for (let result of results) {
//                     movies.push({ title: result.title, id: result.id })
//                 }
//                 console.log(movies)
//                 resolve(movies)
//             }
//         };
//         xhttp.open("GET", url, true);
//         xhttp.send()

//     })
// }

// function getKeywords(data) {
//     return new Promise(async function (resolve, reject) {
//         var dataParsed = JSON.parse(data);
//         var movieID = dataParsed.id;
//         var apiKey = "c07a02e77846bc61b3a6ece1fabeeee2";
//         var keywords = []
//         var url = "https://api.themoviedb.org/3/movie/" + movieID + "/keywords?api_key=" + apiKey
//         var xhttp = new XMLHttpRequest;
//         xhttp.onreadystatechange = function () {
//             if (this.readyState == 4 && this.status == 200) {
//                 let results = JSON.parse(xhttp.responseText).keywords;
//                 console.log(results)
//                 for (let result of results) {
//                     keywords.push(result.name)
//                 }
//                 console.log(keywords)
//                 // resolve(keywords)
//             }
//         };
//         xhttp.open("GET", url, true);
//         await xhttp.send()
//         resolve(keywords)
//     })
// }

async function findTopThreeMovies(genreIdArray, userInput) {
    return new Promise(async function (resolve, reject) {
        let movies = await TMDB.getMoviesByGenre(genreIdArray[0]);
        console.log(movies)
        console.log(1)
        for (let i = 1; i < genreIdArray.length; i++) {
            movies = await movies.concat(TMDB.getMoviesByGenre(genreIdArray[1]));
            console.log(2)
        }
        console.log(3)
        let parsedTextObject = await TextAnalysis.parseText(userInput)
        let input = parsedTextObject.adjectives.concat(parsedTextObject.nouns, parsedTextObject.places);
        let wordArrayTwo = await TextAnalysis.getSimilarWords(input);
        for (let j = 0; j < movies.length; j++) {
            console.log("one")
            let keywordsRaw = await TMDB.getKeywords(movies[j].id);
            if (keywordsRaw) {
                console.log("two")
                let keywords = TextAnalysis.parseKeywords(keywordsRaw);
                console.log("three")
                let wordArrayOne = await TextAnalysis.getSimilarWords(keywords);
                movies[j].score = TextAnalysis.scoreWordArrayByWordArray(wordArrayOne, wordArrayTwo);
                console.log("hi")
            }
            else {
                movies[j].score = 0
            }
        }
        movies.sort(function(a, b) {
            return b.score - a.score;
        })
        let topThreeTitles = [movies[0], movies[1], movies[2]]
        console.log(topThreeTitles)
        resolve(topThreeTitles);
    })
}

async function search(input) {
    return new Promise(async function(resolve, reject) {
        var topThreeGenres = await findRelevantGenres(input)
        topThreeGenres = topThreeGenres.map((x) => { return x.id})
        var topThree = await findTopThreeMovies(topThreeGenres, input)
        console.log(topThree);
        resolve(topThree);
    })
}

// test()
