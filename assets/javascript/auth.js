
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
    firebase.auth().createUserWithEmailAndPassword(email, pass).catch(function(error) {
      throw new Error(`Error ${error.errorCode}: ${error.message}`);
    });
  },
  signIn: function(method, email, pass){
    switch(method){
      case "email":
          firebase.auth().signInWithEmailAndPassword(email, pass).catch(function(error) {
            throw new Error(`Error ${error.errorCode}: ${error.message}`);
          });
        return;
      case "google":
        var provider = new firebase.auth.GoogleAuthProvider();

        firebase.auth().signInWithPopup(provider).catch(function(error) {
          throw new Error(`Error ${error.errorCode}: ${error.message}`);
        });
        return;
    }
  },
  activeUser: function(){
    return firebase.auth().currentUser;
  },
  signOut: function(){
    firebase.auth().signOut();
  }
}