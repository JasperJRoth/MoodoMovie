
var provider = new firebase.auth.GoogleAuthProvider();

const siteAuth = {
  signIn: function(){
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // The signed-in user info.
        var user = result.user;
  
        console.log(`Signed in successfully as: ${user.email}`);
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
  
        console(`Login failed with user: ${email} on auth provider ${credential}`);
        console.log(`Error ${errorCode}: ${errorMessage}`);
      });
  },
  getUserData: async function(){
    var sendCall = firebase.functions().httpsCallable("getUserData");
  
    return await sendCall().then(function(result) {
      return result.data;
    }).catch(function(error) {
      throw new Error(`Error ${error.errorCode}: ${error.message}`);
    });
  },
  setUserData: function(data){
    var sendCall = firebase.functions().httpsCallable("setUserData");
  
    sendCall(data).then(function(result) {
      console.log(`Successfully stored data`);
    }).catch(function(error) {
      throw new Error(`Error ${error.errorCode}: ${error.message}`);
    });
  }
}