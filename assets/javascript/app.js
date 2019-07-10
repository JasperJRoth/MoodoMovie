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
    var movieId = $(this).attr("id");
    var movie;
    
    for(var i=0; i < moviesSearched.length; i++) {
        if(moviesSearched[i].imdbID === movieId){
            movie = moviesSearched[i];
            break;
        }
    }

    $("#movies").children('img').removeClass("movie-selected");
    $(this).addClass("movie-selected");
    $movieDetail.empty();

    $movieDetail.append($("<h3>").text(movie.Title));
    $movieDetail.append($("<p>").text(`Awards: ${movie.Awards}`));
    $movieDetail.append($("<p>").text(`${movie.Year} - ${movie.Genre}`));
    $movieDetail.append($("<p>").text(`Language: ${movie.Language}`));
    $movieDetail.append($("<p>").text(`Production: ${movie.Production}`));
    $movieDetail.append($("<p>").text(`Director: ${movie.Director}`));
    $movieDetail.append($("<p>").text(movie.Plot));
    
    $movieDetail.css("display","block");
}

/** 
 * Gets the movie info from the OMDB API result object place it into the page
 * Params:  => movie: OMDB API result object with the movie info
 * **/
function renderMovie(movie){
    var $img = $("<img>");
    $img.attr("src",movie.Poster);
    $img.attr("id",movie.imdbID);
    $img.click(renderMovieDetails);

    $movies.append($img);
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
                //console.log(result);
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


//THIS IS TEST DATA - MUST BE REMOVED AFTER THE SEARCH IS WORKING
getMoviesInfo([{title: "Matrix", year: "1999"},{title: "Tomb Raider", year: "2018"},{title: "Superman", year: "2018"}]);

$(document).ready(function(){
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