/**
 * GLOBAL DOM VARIABLES
 */
var $movies;
var $movieDetail;


/**
 * GLOBAL VARIABLES
 */
var moviesSearched; //stores info for all the movies searched
var movieSelected = ""; //stores the imdbID of the current selected movie


function closeDetail(){
    $movies.children('.card').removeClass("movie-hidden");
    $movieDetail.css("display","none");
    movieSelected = "";
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

            var $btnWrap = $("#play-btn");
            var $trailerButton = $(`<button  class="btn-floating btn-small red">`).html(`<i class="fas fa-play play-icon" id="play-icon"></i>`);

            $trailerButton.magnificPopup({
                items: {
                    src: `https://www.youtube.com/watch?v=${result.results[0].key}`
                },
                type: 'iframe' // this is default type
            });

            $btnWrap.append($trailerButton);
            $btnWrap.append(" Play Trailer");
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

    if (movieSelected != movieId){
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

        var $cardTitle = $(`<span class="card-title">`).text(movie.Title);
        $cardTitle.append($(`<span class="card-title-detail">`).text(` (${movie.Year})`));
        
        var $cardInfo = $("<div class='general-info'>");

        $cardContent.empty();
        
        $cardContent.append($cardTitle);
        $cardInfo.append($("<span>").html(`<i class="fas fa-film genre"></i> ${movie.Genre}`));
        $cardInfo.append($("<span>").html(`<i class="fas fa-globe language"></i> ${movie.Language}`));
        $cardInfo.append($("<span>").html(`<i class="far fa-clock clock"></i> ${movie.Runtime}`));
        $cardInfo.append($("<span>").html(`<i class="fas fa-globe-americas country"></i> ${movie.Country}`));
        $cardInfo.append($("<span>").html(`<i class="fas fa-video production"></i> ${movie.Production}`));
        $cardInfo.append($("<span>").html(`<i class="fas fa-trophy awards"></i> ${movie.Awards}`));

        $cardContent.append($cardInfo);
        

        var $plotHeader =$("<div id='plot-header'>");
        $plotHeader.append($("<span>").text("Overview"))
        $plotHeader.append($(`<div id="play-btn">`))
        $cardContent.append($plotHeader);

        $cardContent.append($("<p id='plot'>").html(movie.Plot));
        
        var $crew =$("<div id='crew'>");
        
        $crew.append($("<p>").html(`Director<br>${movie.Director}`));
        $crew.append($("<p>").html(`Actors<br>${movie.Actors}`));
        $crew.append($("<p>").html(`Writer<br>${movie.Writer}`));
        

        $cardContent.append($("<p id='crew-header'>").text("Crew"));
        $cardContent.append($crew);

        $cardImg.attr("src",movie.Poster);
        getMovieTrailer(movie.id_themoviedb);
        movieSelected = movieId;
    
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
                console.log(result);
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