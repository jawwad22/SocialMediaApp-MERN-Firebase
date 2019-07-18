const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const cors = require('cors');
app.use(cors());


const {
    getAllScreams,
    insertScream
} = require('./handlers/screams')
const {
    signup, login

} = require('./handlers/user')



// Initialize Firebase

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

//Screams Route
app.get('/getscreams', FBAuth, getAllScreams)
app.post('/insertscreams', FBAuth, insertScream)

//signUp route
app.post('/signup', signup)
app.post('/login', login)




exports.api = functions.https.onRequest(app);
