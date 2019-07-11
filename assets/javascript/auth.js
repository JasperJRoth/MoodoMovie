
const siteAuth = {
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
  },
  signUp: function(email, pass){
    console.log(email);
    firebase.auth().createUserWithEmailAndPassword(email, pass).then(function(){
      M.toast({html: "Signed up successfully!"});
    }).catch(function(error) {
      M.toast({html: `Sign up failed. Error ${error.errorCode}: ${error.message}`});
    });
  },
  signIn: function(method, email, pass){
    switch(method){
      case "email":
          firebase.auth().signInWithEmailAndPassword(email, pass).then(function(){
            M.toast({html: "Signed in successfully!"});
          }).catch(function(error) {
            M.toast({html: `Sign in failed. Error ${error.errorCode}: ${error.message}`});
          });
        return;
      case "google":
        var provider = new firebase.auth.GoogleAuthProvider();

        firebase.auth().signInWithPopup(provider).then(function(){
          M.toast({html: "Signed in successfully!"});
        }).catch(function(error) {
          M.toast({html: `Sign in failed. Error ${error.errorCode}: ${error.message}`});
        });
        return;
    }
  },
  activeUser: function(){
    return firebase.auth().currentUser;
  },
  signOut: function(){
    firebase.auth().signOut().then(function(){
      M.toast({html: "Signed Out."});
    });
  }
}