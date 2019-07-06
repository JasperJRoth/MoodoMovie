var testString = nlp("I'm looking for a movie that is sad but also heartwarming and sweet and will make me cry. Something I can watch with my kids but with snappy dialogue.")

var testReview = `This is a very clever animated story that was a big hit, and justifiably so. It had a terrific sequel and if a third film came out, that would probably be a hit, too.

When this came out, computer technology just was beginning to strut its stuff. Man, this looked awesome. Now, it's routine because animation, which took a giant leap with this movie, has made a lot more giant strides.

The humor in here, however, is what made this so popular. There are tons of funny lines, issued by characters voiced by Tom Hanks, Tim Allen, Jim Varney, Don Rickles, Wallace Shawn and John Ratzenberger, among others. As good as Hanks is as "Woody" and Allen as "Buzz Armstrong," I think the supporting characters just about stole the show: Mr. Potato Head, Slinky, Rex the dinosaur, etc.

Multiple viewings don't diminish the entertainment, either. There are so many things to catch, audibly and visually, that you always seem to discover something new. The colors in here are beautiful, too. This is a guaranteed "winner" as is the sequel.`

var textParsed = {
    people: testString.people().out("array"),
    adjectives: testString.adjectives().out("array"),
    places: testString.places().out("array"),
}

var adjectiveArray = []

for (let adjective of textParsed.adjectives) {
    adjectiveArray.push([adjective, 2])
    var maxscore
    $.ajax({
        url: "http://api.datamuse.com/words?ml="+adjective,
        method: "GET"
    }).then(function(response) {
        for (let i = 0; i < 20; i++) {
            let item = response[i]
            if (i === 0) {
                maxscore = item.score
            }
            let score = item.score/maxscore
            if (item.tags.includes("adj") && item.score > 2500) {
                adjectiveArray.push([item.word, score])
            }
        }
        console.log(adjectiveArray)
    })
}

setTimeout(function() {
    var score = 0;
    for (let adjective of adjectiveArray) {
        let adjectiveRegEx = new RegExp(adjective[0], "g");
        let count = (testReview.match(adjectiveRegEx) || []).length;
        score += count * adjective[1];
    }
    console.log(score)
}, 1000)
