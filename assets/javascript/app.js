/**
 * GLOBAL DOM VARIABLES
 */
var $movies;
var $movieDetail;


/**
 * GLOBAL VARIABLES
 */
var moviesSearched; //stores info for all the movies searched
var movieSelected = false; //stores the imdbID of the current selected movie


function closeDetail(){
    $movies.children('.card').removeClass("movie-hidden");
    $movieDetail.css("display","none");
    movieSelected = false;
}


function getMovieTrailer(id){
    
    var queryURL = `https://api.themoviedb.org/3/movie/${id}/videos?api_key=70eed93477dcef6557dc7a7fb7b1501b&language=en-US&`;
    
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (result){
        if(result.Error) {
            console.log(result.Error);
        }
        else{
            let $video = $(`<div class="video-container">`);
            $video.append(`<iframe width="853" height="480" src="//www.youtube.com/embed/${result.results[0].key}?rel=0" frameborder="0" allowfullscreen></iframe>`);
            $("#movie-detail .card-content").append($video);
        }
    });    
    
}

/**
 * Render the details of the movie clicked by the user
 */
function renderMovieDetails(){
    var movieId = $(this).attr("data-cardid");
    var movie;
    var $cardContent = $("#movie-detail .card-content");
    var $cardAction = $("#movie-detail .card-action");
    var $cardImg = $("#movie-detail img");

    if (!movieSelected){
        for(var i=0; i < moviesSearched.length; i++) {
            if(moviesSearched[i].imdbID === movieId){
                movie = moviesSearched[i];
                break;
            }
        }

        var $linkClose = $(`<a href="#">`).text("Close");
        $linkClose.click(closeDetail);
        $cardAction.empty();
        $cardAction.append($linkClose);

        $cardContent.empty();
        $cardContent.append($(`<span class="card-title">`).text(movie.Title));
        $cardContent.append($("<p>").html(`${movie.Year} - ${movie.Genre}`));
        $cardContent.append($("<p>").html(`<i class="fas fa-trophy"></i> ${movie.Awards}`));
        $cardContent.append($("<p>").html(`<i class="fas fa-globe-americas"></i> ${movie.Language}`));
        $cardContent.append($("<p>").html(`<i class="fas fa-video"></i> ${movie.Production}`));
        $cardContent.append($("<p>").html(`Director: ${movie.Director}`));
        $cardContent.append($("<p>").html(`<br>${movie.Plot}`));

        $cardImg.attr("src",movie.Poster);
        getMovieTrailer(movie.id_themoviedb);
        movieSelected = true;
    
    }
    $movieDetail.css("display","flex");
    $movies.children('.card').addClass("movie-hidden");
}

/** 
 * Gets the movie info from the OMDB API result object place it into the page
 * Params:  => movie: OMDB API result object with the movie info
 * **/
function renderMovie(movie){
    var $card = $("<div class='card'>");
    var $cardImg = $("<div class='card-image'>");
    var $cardContent = $("<div class='card-content'>");
    var $img = $("<img>");

    $img.attr("src",movie.Poster);
    $img.attr("data-cardid",movie.imdbID);
    $img.click(renderMovieDetails);
        
    $cardImg.append($img);
    
    $cardContent.append($("<span class='card-title'>").text(movie.Title));
    $cardContent.append($("<p>").text(movie.Plot));

    $card.attr("id",movie.imdbID)
    $card.append($cardImg);
    $card.append($cardContent);

    $movies.append($card);
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
                result.id_themoviedb = movie.id;
                moviesSearched.push(result);
                renderMovie(result);
            }
        });    
    });

}

//show the sign in screen so the user can authenticate
function showSignIn(){
    hideSignUp();
    $("#loginForm").css("display", "block");
}

function hideSignIn(){
    $("#loginForm").css("display", "none");
}

function showSignUp(){
    hideSignIn();
    $("#signupForm").css("display", "block");
}

function hideSignUp(){
    $("#signupForm").css("display", "none");
}

function showSignUpButton(){
    $("#signUp").css("display", "inline-block");
}

function hideSignUpButton(){
    $("#signUp").css("display", "none");
}

//show the things that user is able to do once it is authenticated
function app(user){
    console.log(user);
}

//checks if the user is authenticated
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        $("#signInOut").text("Sign Out");
        hideSignUpButton();
    } else {
        $("#signInOut").text("Log In");
        showSignUpButton();
    }
});

function searchMovies(){
    $movies.empty();
    $movieDetail.css("display","none");
    //THIS IS TEST DATA - MUST BE REMOVED AFTER THE SEARCH IS WORKING
    getMoviesInfo([{title: "Matrix", year: "1999", id: "603"},{title: "Tomb Raider", year: "2018", id:"338970"},{title: "Superman", year: "2018", id:"1924"}]);
}


$(document).ready(function(){
    $movies = $("#movies");
    $movieDetail = $("#movie-detail");

    $("#search-button").click(searchMovies);
    $("#search-input").keypress(event => {
        if(event.key.toUpperCase() == "ENTER"){
            searchMovies();
        }
    });

    $("#signInOut").on("click", function(event){
        if(siteAuth.activeUser()){
            hideSignIn()
            siteAuth.signOut();
        }else{
            showSignIn();
        }
    });

    $("#signUp").on("click", function(event){
        showSignUp();
    });

    $("#googleSignIn").on("click", function(event){
        hideSignIn()
        siteAuth.signIn("google");
    });

    $("#loginSubmit").on("click", function(){
        var email = $("#loginEmail").val();
        var pass = $("#loginPass").val();
        
        hideSignIn()
        siteAuth.signIn("email", email, pass);
    });

    $("#signupSubmit").on("click", function(){
        var email = $("#signupEmail").val();
        var pass = $("#signupPass").val();
        
        hideSignUp()
        siteAuth.signUp(email, pass);
    });
});