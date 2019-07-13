var TextAnalysis = {
    parseText(string) {
        let textObject = nlp(string);
        let parsedTextObject = {
            people: textObject.people().out("array"),
            adjectives: textObject.adjectives().out("array"),
            places: textObject.places().out("array"),
            nouns: textObject.nouns().toSingular().out("array")
        }
        parsedTextObject.nouns = parsedTextObject.nouns.filter((x) => { return x != "movie" })
        return parsedTextObject;
    },
    getSimilarWords(inputWordArray) {
        return new Promise(function(resolve, reject) {
            var outputWordArray = [];
            for (let j = 0; j < inputWordArray.length; j++) {
                let word = inputWordArray[j];
                outputWordArray.push([word, 3])
                var maxscore
                $.ajax({
                    url: "http://api.datamuse.com/words?ml="+word+"&topics=movie",
                    method: "GET"
                }).then(function(response) {
                    for (let i = 0; i < response.length; i++) {
                        let item = response[i]
                        if (i === 0) {
                            maxscore = item.score
                        }
                        let score = item.score / maxscore
                        if (score > 0) {
                            outputWordArray.push([item.word, score])
                        }
                    }
                    if (j === inputWordArray.length - 1) {
                        resolve(outputWordArray);
                    }
                })
                // let xhttp = new XMLHttpRequest;
                // let url = "https://api.datamuse.com/words?ml=" + word + "&topics=movie"
                // xhttp.onreadystatechange = function() {
                //     if (this.readyState == 4 && this.status == 200) {
                //         let results = JSON.parse(xhttp.responseText).results;
                //         for (let i = 0; i < results.length; i++) {
                //             let item = results[i]
                //             if (i === 0) {
                //                 maxscore = item.score
                //             }
                //             let score = item.score/maxscore
                //             if (score > 0) {
                //                 outputWordArray.push([item.word, score])
                //             }
                //         }
                //         if (j === inputWordArray.length - 1) {
                //             resolve(outputWordArray);
                //         }
                //     }
                // }
                // xhttp.open("GET", url, true);
                // xhttp.setRequestHeader("Access-Control-Allow-Origin", "*")
                // xhttp.setRequestHeader("Access-Control-Allow-Methods", "GET")
                // xhttp.send()
            }
        })
    },
    getSimilarWordsSafe(inputWordArray) {
        return new Promise(function (resolve, reject) {
            var outputWordArray = [];
            for (let j = 0; j < inputWordArray.length; j++) {
                let word = inputWordArray[j];
                outputWordArray.push([word, 3])
                var maxscore
                $.ajax({
                    url: "https://cors-anywhere.herokuapp.com/https://api.datamuse.com/words?ml=" + word + "&topics=movie",
                    method: "GET"
                }).then(function (response) {
                    for (let i = 0; i < response.length; i++) {
                        let item = response[i]
                        if (i === 0) {
                            maxscore = item.score
                        }
                        let score = item.score / maxscore
                        if (score > 0) {
                            outputWordArray.push([item.word, score])
                        }
                    }
                    if (j === inputWordArray.length - 1) {
                        resolve(outputWordArray);
                    }
                })
            }
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
        let wordsOne = {}
        let wordsTwo = {}
        var score = 0;
        for (let wordDuo of wordArrayOne) {
            if (wordsOne.hasOwnProperty(wordDuo[0])) {
                wordsOne[wordDuo[0]] += wordDuo[1];
            }
            else {
                wordsOne[wordDuo[0]] = wordDuo[1];
            }
        }
        for (let wordDuo of wordArrayTwo) {
            if (wordsTwo.hasOwnProperty(wordDuo[0])) {
                wordsTwo[wordDuo[0]] += wordDuo[1];
            }
            else {
                wordsTwo[wordDuo[0]] = wordDuo[1];
            }
        }
        for (let i = 0; i < wordArrayOne.length; i++) {
            if (wordsTwo.hasOwnProperty(wordArrayOne[i][0])) {
                score += wordsTwo[wordArrayOne[i][0]]
            }
        }
        for (let j = 0; j < wordArrayTwo.length; j++) {
            if (wordsOne.hasOwnProperty(wordArrayTwo[j][0])) {
                score += wordsOne[wordArrayTwo[j][0]]
            }
        }
        score = (score * 100) / wordArrayOne.length;
        return score;
    },
    parseKeywords(keywords) {
        var keywordsParsed = []
        for (let keyword of keywords) {
            let parsedKeywordObject = this.parseText(keyword);
            keywordsParsed = keywordsParsed.concat(parsedKeywordObject.adjectives, parsedKeywordObject.nouns, parsedKeywordObject.places);
        }
        return keywordsParsed;
    },
    multiplyByGenre(genreID, userInput) {
        let multiplier = 1;
        for (let word of genresById[genreID].multiplierArray) {
            if (userInput.indexOf(word) > -1) {
                multiplier += 4
            }
        }
        return multiplier
    },
    multiplyByInput(input, plot) {
        let multiplier = 1;
        for (let word of input) {
            if (plot.indexOf(word) > -1) {
                multiplier += 4
            }
        }
        return multiplier
    }
}

const genresConstant = JSON.stringify([
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
])

var genresById = {
    "28": {
        "name": "Action",
        "wordArray": ['action', 'police', 'army', 'fight', 'shoot', 'punch', 'kick', 'die', 'kill', 'tough', 'strong', 'angry'],
        multiplierArray: ['action', 'shoot', 'fight', 'army']
    },
    "12": {
        "name": "Adventure",
        "wordArray": ['fun', 'travel', 'action', 'adventure', 'swashbuckling', 'treasure', 'villain', 'happy'],
        multiplierArray: ['adventure', 'swashbuckling', 'evil', 'action']
    },
    "16": {
        "name": "Animation",
        "wordArray": ['animation', 'children', 'nostalgia', 'fun', 'disney', 'pixar', 'fairy tale', 'happy'],
        multiplierArray: ['animat', 'family', 'cartoon', 'kid']
    },
    "35": {
        "name": "Comedy",
        "wordArray": ['laugh', 'comedy', 'fun', 'happy', 'joke', 'irreverant', 'dumb'],
        multiplierArray: ['laugh', 'comedy', 'funny', 'joke']
    },
    "80": {
        "name": "Crime",
        "wordArray": ['police', 'law', 'crime', 'robbery', 'murder', 'tough', 'action', 'criminal', 'gangster'],
        multiplierArray: ['crime', 'robber', 'gangster', 'criminal']
    },
    "99": {
        "name": "Documentary",
        "wordArray": ["documentary", "non-fiction", 'real world', 'people', 'story', 'history'],
        multiplierArray: ['documentary', 'real', 'history', 'true']
    },
    "18": {
        "name": "Drama",
        "wordArray": ['sad', 'drama', 'serious', 'family', 'love', 'angry', 'bittersweet', 'prestige', 'awards'],
        multiplierArray: ['drama', 'serious', 'award', 'prestige']
    },
    "10751": {
        "name": "Family",
        "wordArray": ['family', 'children', 'fun', 'young', 'happy', 'animation'],
        multiplierArray: ['family', 'cartoon', 'kid', 'animat']
    },
    "14": {
        "name": "Fantasy",
        "wordArray": ['fantasy', 'magic', 'knight', 'dragon', 'speculative', 'fun', 'dramatic', 'adventure'],
        multiplierArray: ['fantasy', 'magic', 'adventure', 'adventure']
    },
    "36": {
        "name": "History",
        "wordArray": ['history', 'real world', 'non-fiction', 'prestige', 'awards', 'drama'],
        multiplierArray: ['history', 'true', 'award', 'real']
    },
    "27": {
        "name": "Horror",
        "wordArray": ['scary', 'spooky', 'monster', 'death', 'horror', 'darkness', 'gore', 'blood', 'death'],
        multiplierArray: ['horror', 'gore', 'scary', 'monster']
    },
    "10402": {
        "name": "Music",
        "wordArray": ["music", 'band', 'song', 'happy', 'disney', 'fun', 'dance', 'musical'],
        multiplierArray: ['musical', 'music', 'band', 'dance']
    },
    "9648": {
        "name": "Mystery",
        "wordArray": ['mystery', 'detective', 'clues', 'murder', 'sherlock holmes', 'deduction', 'crime', 'drama', 'comedy'],
        multiplierArray: ['mystery', 'detective', 'sherlock', 'murder']
    },
    "10749": {
        "name": "Romance",
        "wordArray": ['romance', 'love', 'sad', 'happy', 'sex', 'marraige', 'meet cute', 'comedy'],
        multiplierArray: ['romance', 'romantic', 'love', 'marraige']
    },
    "878": {
        "name": "Science Fiction",
        "wordArray": ['science', 'science fiction', 'robot', 'space', 'fantasy', 'future', 'technology', 'speculative'],
        multiplierArray: ['science', 'space', 'future', 'technology']
    },
    "53": {
        "name": "Thriller",
        "wordArray": ['thriller', 'exciting', 'drama', 'serious', 'horror', 'cerebral'],
        multiplierArray: ['thriller', 'exciting', 'drama', 'horror']
    },
    "10752": {
        "name": "War",
        "wordArray": ['war', 'history', 'army', 'soldier', 'non-fiction', 'marines', 'navy', 'world war'],
        multiplierArray: ['war', 'history', 'army', 'soldier']
    },
    "37": {
        "name": "Western",
        "wordArray": ['western', 'cowboy', 'sharpshooter', 'wild west', 'sherrif', 'native american', 'mexican'],
        multiplierArray: ['western', 'cowboy', 'sheriff', 'shoot']
    }
}

var genresList = null;

async function findRelevantGenres(userInput) {
    return new Promise(async function(resolve, reject) {
        genresList = JSON.parse(genresConstant);
        let parsedTextObject = await TextAnalysis.parseText(userInput)
        let input = parsedTextObject.adjectives.concat(parsedTextObject.nouns, parsedTextObject.places, parsedTextObject.people);
        if (input.length === 0) {
            $("#status-container").attr("class", "hidden")
            $("#movies").text("*Please enter a longer search, this query will receive no results")
            resolve(false);
        }
        let wordArrayTwo = await TextAnalysis.getSimilarWords(input);
        for (let i = 0; i < genresList.length; i++) {
            genresList[i].wordArray = await TextAnalysis.getSimilarWords(genresList[i].wordArray);
            genresList[i].score = TextAnalysis.scoreWordArrayByWordArray(genresList[i].wordArray.slice(0, 200), wordArrayTwo) * TextAnalysis.multiplyByGenre(genresList[i].id, userInput);
            genresById[genresList[i].id].score = genresList[i].score 
            step++
            renderStatus();
        }
        genresList.sort(function (a, b) {
            return b.score - a.score;
        })
        let topTwoGenres = [genresList[0], genresList[1]]
        step++
        await renderStatus()
        resolve(topTwoGenres);
    })
}

var TMDB = {
    getKeywords(movieID) {
        return new Promise(async function(resolve, reject) {
            if (movieID) {
                let data = {id: movieID};
                let sendCall = firebase.functions().httpsCallable("getKeywords");
                let keywords
                sendCall(data).then(function(result) {
                    keywords = result.data
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
            for (let i = 1; i <= 5; i++) {
                let data = { id: genreID, page: i };
                step++
                let rendered = await renderStatus()
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

function scoreMoviesByGenre(movie) {
    score = 0;
    if (movie.genres) {
        for (let genreID of movie.genres) {
            if (genresById[genreID]) {
                score += genresById[genreID].score;
            }
        }
        denominator = Math.max(movie.genres.length - 1, 1)
        score = score / denominator;
    }
    return score;
}
var step = 0;

async function findTopFiveMovies(genreIdArray, userInput) {
    return new Promise(async function (resolve, reject) {
        let movies = await TMDB.getMoviesByGenre(genreIdArray[0]);
        for (let i = 1; i < genreIdArray.length; i++) {
            moviesToConcat = await TMDB.getMoviesByGenre(genreIdArray[i]);
            movies = movies.concat(moviesToConcat);
        }
        let parsedTextObject = await TextAnalysis.parseText(userInput)
        let input = parsedTextObject.adjectives.concat(parsedTextObject.nouns, parsedTextObject.places, parsedTextObject.people);
        let wordArrayTwo = await TextAnalysis.getSimilarWords(input);
        for (let j = 0; j < movies.length; j++) {
            let parsedPlotObject = TextAnalysis.parseText(movies[j].plot)
            let inputPlot = parsedPlotObject.adjectives.concat(parsedPlotObject.nouns, parsedPlotObject.places);
            if (inputPlot.length > 0) {
                let wordArrayOne = await TextAnalysis.getSimilarWords(inputPlot);
                movies[j].score = TextAnalysis.scoreWordArrayByWordArray(wordArrayOne, wordArrayTwo) + scoreMoviesByGenre(movies[j]);
                movies[j].score = movies[j].score * TextAnalysis.multiplyByInput(input, movies[j].plot)
            }
            else {
                movies[j].score = scoreMoviesByGenre(movies[j])
            }
            step++
            await renderStatus();
        }
        movies.sort(function(a, b) {
            return b.score - a.score;
        })
        let a = 1;
        while (movies[a].title === movies[0].title) {
            a++;
        }
        let b = a + 1;
        while (movies[b].title === movies[a].title || movies[b].title === movies[0].title) {
            b++;
        }
        let c = b + 1;
        while (movies[c].title === movies[a].title || movies[c].title === movies[0].title || movies[c].title === movies[b].title) {
            c++;
        }
        let d = c + 1;
        while (movies[d].title === movies[a].title || movies[d].title === movies[0].title || movies[d].title === movies[b].title || movies[d].title === movies[c].title) {
            d++;
        }
        let TopFiveTitles = [movies[0], movies[a], movies[b], movies[c], movies[d]]
        step++
        await renderStatus();
        resolve(TopFiveTitles);
    })
}

var statusBar = $("#status-bar")

function renderStatus() {
    return new Promise(function(resolve, reject) {
        let percentage = Math.floor(step / 230 * 100) + "%";
        statusBar.css("width", percentage).promise().done(function() {
            resolve(true)
        })
        statusBar.text(percentage);
    })
}

async function search(input) {
    return new Promise(async function(resolve, reject) {
        $("#status-container").attr("class", "")
        var topTwoGenres = await findRelevantGenres(input)
        if (topTwoGenres) {
            topTwoGenres = topTwoGenres.map((x) => { return x.id })
            var TopFive = await findTopFiveMovies(topTwoGenres, input)
            step = 0
            genresList = null;
            renderStatus()
             $("#status-container").attr("class", "hidden")
            resolve(TopFive);
        }
    })
}

