/** 
 * Gets the movie poster from the OMDB api and place it into the image source passed by its element id
 * Params:  => movieTitle: the full title of the movie
 *          => elementId: the ID of the DOM image element (<img>)
 * 
 * This is an asynchronous function, so make sure that the element is already created in the DOM!
 * **/
function moviePoster(movieTitle, elementId){
    
    var defaultImg = "assets/images/poster-default.png";
    var $img = $("#"+elementId);
    var queryParams = {};

    queryParams.apikey = "trilogy";
    queryParams.t = movieTitle;

    var queryURL = "https://www.omdbapi.com/?" + $.param(queryParams);

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (result){

        if(result.Error) {
            $img.attr("src", defaultImg);
            console.log(result.Error);
        }
        else{
            $img.attr("src",result.Poster);
        }
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