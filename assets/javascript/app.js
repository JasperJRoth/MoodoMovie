/**
 * CONSTANTS 
 * */
const WATCHED_ICON = "turned_in";
const NOT_WATCHED_ICON = "turned_in_not";
const MSG_TOOLTIP_WATCHED = "Click to mark as watched!";
const MSG_TOOLTIP_NOT_WATCHED = "Click to mark as NOT watched!";

/**
 * GLOBAL DOM VARIABLES
 */
var $movies;
var $movieDetail;
var $watchedListButton;

/**
 * GLOBAL VARIABLES
 */
var moviesSearched; //stores info for all the movies searched
var moviesWatched = []; //stores the list of movie objects that the user marked as wathed
var movieSelected = ""; //stores the imdbID of the current selected movie
var searchIsRunning = false;
var countMovies;

//stores the watched movie in the localStorage
function storeWatchedList(data){
    //check if browser supports storage
    if (typeof(Storage) !== "undefined") {
        window.localStorage.setItem("watched", JSON.stringify(data));
    }

    //update the firebase storage
    siteAuth.setUserData(data);

}

//retrieves the watched movies stored in the localStorage
function getWatchedListFromLocal(){
    var data = [];
    //check if browser supports storage
    if (typeof(Storage) !== "undefined") {
        if(localStorage.getItem("watched") !== null){
            data = JSON.parse(window.localStorage.getItem("watched"));
            if(data.length ===0) data = [];
        }
    }

    return data;

}

function toggleWatchedMovie(){
    movieId = $(this).attr("data-movieid");
    status = $(this).attr("data-status");
    watchedListOpen = $("#watched-list-shown").val();
    
    //if the status is marked as watched
    if(status === "yes"){
        //uncheck (remove item)

        //look for the movie in the list of movies watched
        for(var i=0; i < moviesWatched.length; i++) {
            if(moviesWatched[i].imdbID === movieId){
                movie = moviesWatched[i];
                moviesWatched.splice(i,1); //remove the movie from the watched list
                break;
            }
        }
                
        //change the icon to the unchecked one
        $(`.data-${movieId}`).children("i").text(NOT_WATCHED_ICON);
        $(`.data-${movieId}`).attr("data-status","no");
        $(`.data-${movieId}`).attr("title",MSG_TOOLTIP_WATCHED);

        if(watchedListOpen == "yes"){
            $(`#${movieId}`).remove();
        }
    }
    else{
        //check (add item)

        //grab for the movie in the list of movies searched
        for(var i=0; i < moviesSearched.length; i++) {
            if(moviesSearched[i].imdbID === movieId){
                movie = moviesSearched[i];
                moviesWatched.push(movie); //add the movie in the watched list
                break;
            }
        }

        //change the icon to the checked one
        $(`.data-${movieId}`).children("i").text(WATCHED_ICON);
        $(`.data-${movieId}`).attr("data-status","yes");
        $(`.data-${movieId}`).attr("title",MSG_TOOLTIP_NOT_WATCHED);
    }

    //update the localStorage
    storeWatchedList(moviesWatched);
}

//checks whether or not the user watched the movie
function userWatchedMovie(imdbID){
    for(var i=0; i < moviesWatched.length; i++) {
        if(moviesWatched[i].imdbID === imdbID){
            return true;
        }
    }
    return false;
}

//when the user clicks on the Watched List button, here it will render all the movies marked as watched
function showWatchedList(){
    $movies.empty();
    $movieDetail.css("display","none");

    $movies.append($(`<input type="hidden" id="watched-list-shown" value="yes">`));
    moviesWatched.forEach(movie => {
        renderMovie(movie);
    });
}

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
            var $trailerButton = $(`<button class="btn-floating btn-small red">`).html(`<i class="fas fa-play play-icon" id="play-icon"></i>`);

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

//creates the toggle button for check/uncheck the watched movie
function getWatchedActionButton(movieId){

    var $watchedAction = $(`<a class="btn-floating halfway-fab waves-effect waves-light red data-${movieId}">`);
    var $watchedStatus = $(`<i class="material-icons">`);


    if(userWatchedMovie(movieId)){
        $watchedStatus.text(WATCHED_ICON);
        $watchedAction.attr("data-status","yes");
        $watchedAction.attr("title",MSG_TOOLTIP_NOT_WATCHED);
    }
    else{
        $watchedStatus.text(NOT_WATCHED_ICON);
        $watchedAction.attr("data-status","no");
        $watchedAction.attr("title",MSG_TOOLTIP_WATCHED);
    }

    $watchedAction.attr("data-movieid",movieId);
    $watchedAction.click(toggleWatchedMovie);
    $watchedAction.append($watchedStatus);

    return $watchedAction;
         
}

/**
 * Render the details of the movie clicked by the user
 */
function renderMovieDetails(){
    var movieId = $(this).attr("data-cardid");
    var movie;
    var list;
    var watchedListOpen = $("#watched-list-shown").val();
    var $cardContent = $("#movie-detail .card-content");
    var $cardAction = $("#movie-detail .card-action");
    var $cardImg = $("#movie-detail img");

    if(watchedListOpen === "yes")
        list = moviesWatched;
    else
        list = moviesSearched;


    if (movieSelected != movieId){
        for(var i=0; i < list.length; i++) {
            if(list[i].imdbID === movieId){
                movie = list[i];
                break;
            }
        }

        var $linkClose = $(`<a href="#">`).text("Close");
        $linkClose.click(closeDetail);

        $cardAction.empty();
        $cardAction.append($linkClose);

        var $cardTitle = $(`<span class="card-title">`).text(` ${movie.Title}`);
        $cardTitle.append($(`<span class="card-title-detail">`).text(` (${movie.Year})`));
        $cardTitle.prepend(getWatchedActionButton(movieId).attr("class",`btn-floating btn-small red data-${movieId}`));
         
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
    
        /**
         * Search on netflix and prime
         */   

        var $linkNetflix = $(`<a target="_blank" title="Search on Netflix" href="https://www.netflix.com/search?q=${movie.Title}">`);
        var $imgNetflix = $(`<img data-provider="prime" src="assets/images/netflix-icon.jpeg" class="streamicon">`);
        $linkNetflix.append($imgNetflix);
        $cardContent.append($linkNetflix);

        var $spacerIcon = $(`<img ="_blank" class="spacericon">`);
        $cardContent.append($spacerIcon);

        var $linkPrime = $(`<a target="_blank" title="Search on Prime" href="https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${movie.Title}&ie=UTF8">`);
        var $imgPrime = $(`<img data-provider="prime" src="assets/images/prime-icon.png" class="streamicon">`);
        $linkPrime.append($imgPrime);
        $cardContent.append($linkPrime);

        var $spacerIcon = $(`<img ="_blank" class="spacericon">`);
        $cardContent.append($spacerIcon);

        var $linkCrave = $(`<a target="_blank" title="Search on Crave" href="https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${movie.Title}&ie=UTF8">`);
        var $imgCrave = $(`<img data-provider="prime" src="assets/images/crave-icon.png" class="streamicon">`);
        $linkCrave.append($imgCrave);
        $cardContent.append($linkCrave);

        /**
        * end search
        */


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
    $cardImg.append(getWatchedActionButton(movie.imdbID));
    
    $cardContent.append($("<span class='card-title'>").text(movie.Title));
    $cardContent.append($("<p>").text(movie.Plot));

    $card.attr("id",movie.imdbID);
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
    countMovies = 1;
    
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
                console.log(movie.title);
                console.log(result.Error);
            }
            else{
                
                if(countMovies < 4){
                    result.id_themoviedb = movie.id;
                    moviesSearched.push(result);
                    renderMovie(result);
                }
                countMovies++;
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

function hideWatchedListButton(){
    $watchedListButton.css("display","none"); 
}

function showWatchedListButton(){
    $watchedListButton.css("display","block"); 
}


async function searchMovies(){

    if(!searchIsRunning){
        searchIsRunning = true;
        $movies.empty();
        $movieDetail.css("display","none");
    
        var userInput = $("#search-input").val().trim();
        
        if(userInput != ""){
            var results = await search(userInput);
            getMoviesInfo(results);
        }
        searchIsRunning = false;
    }
    
}


$(document).ready(function(){
    $movies = $("#movies");
    $movieDetail = $("#movie-detail");
    $watchedListButton = $("#watchedList");

    $watchedListButton.click(showWatchedList);

    //get watched list from the local storage
    moviesWatched = getWatchedListFromLocal();

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

    //checks if the user is authenticated
    firebase.auth().onAuthStateChanged(async function(user) {
        if (user) {
            $("#signInOut").text("Sign Out");
            hideSignUpButton();
            showWatchedListButton();
            
            //retrieves the watched list stored in the firebase and update the localStoreage
            moviesWatched = await siteAuth.getUserData();
            storeWatchedList(moviesWatched);
            //...

        } else {
            $("#signInOut").text("Log In");
            showSignUpButton();
            hideWatchedListButton();
        }
    });    

});
