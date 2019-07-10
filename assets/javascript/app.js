/**
 * GLOBAL DOM VARIABLES
 */
var $movies = $("#movies");
var $movieDetail = $("#movie-detail");

/**
 * GLOBAL VARIABLES
 */
var moviesSearched; //stores info for all the movies searched

/**
 * Render the details of the movie clicked by the user
 */
function renderMovieDetails(){
    var movieId = $(this).attr("data-imdbid");
    var movie;
    
    for(var i=0; i < moviesSearched.length; i++) {
        if(moviesSearched[i].imbdID === movieId){
            movie = moviesSearched[i];
            break;
        }
    }

    $movieDetail.empty();

    $movieDetail.append($("<h3>").text(movie.Title));
    $movieDetail.append($("<p>").text(`Awards: ${movie.Awards}`));
    $movieDetail.append($("<p>").text(`${movie.Year} - ${movie.Genre}`));
    $movieDetail.append($("<p>").text(`Language: ${movie.Language}`));
    $movieDetail.append($("<p>").text(`Production: ${movie.Production}`));
    $movieDetail.append($("<p>").text(`Director: ${movie.Director}`));
    $movieDetail.append($("<p>").text(movie.Plot));
    
}

/** 
 * Gets the movie info from the OMDB API result object place it into the page
 * Params:  => movie: OMDB API result object with the movie info
 * **/
function renderMovie(movie){
    //var defaultImg = "assets/images/poster-default.png";

    var $figure = $("<figure>");

    var $caption = $("<figcaption>");
    $caption.text(movie.Title);

    var $img = $("<img>");
    $img.attr("src",movie.Poster);
    $img.attr("data-imdbid",movie.imbdID);
    $img.click(renderMovieDetails);

    $figure.append($caption);
    $figure.append($img);

    $movies.append($figure);

}

/** 
 * Gets the movies info from the OMDB api and place it into the page
 * Params:  => movies: object with the movies that will be shown 
 * **/
function getMoviesInfo(movies){
    moviesSearched = [];

    
    var queryParams = {};
    queryParams.apikey = "trilogy";

    movies.forEach(movie => {
        queryParams.t = movie.title;
        queryParams.y = movie.year;

        var queryURL = "https://www.omdbapi.com/?" + $.param(queryParams);
    
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (result){
    
            if(result.Error) {
                console.log(result.Error);
            }
            else{
                console.log(result);
                moviesSearched.push(result);
                renderMovie(result);
            }
        });    
    });

}

//show the sign in screen so the user can authenticate
function showSignIn(){
    console.log("user should be authenticated. Show the authentication form!")
}

//show the things that user is able to do once it is authenticated
function app(user){
    console.log(user);
}

//checks if the user is authenticated
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        //show the things that user can do when it's autheticated
        app(user); 
    } else {
        //send the user to the authentication form
        showSignIn(); //method should be created
    }
});


//THIS IS TEST DATA - MUST BE REMOVED AFTER THE SEARCH IS WORKING
console.log(getMoviesInfo([{title: "Matrix", year: "1999"},{title: "Tomb Raider", year: "2018"},{title: "Superman", year: "2018"}]));