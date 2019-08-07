const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const cors = require('cors');
app.use(cors());


const {
    getAllScreams,
    insertScream,
    getScream,
    commentOnScream,
    likeScream,
    unlikeScream,
    deleteScream,
} = require('./handlers/screams')
const {
    signup,
    login,
    uploadImage,
    addUserDetails,
    getAuthenticatedUser
} = require('./handlers/user')

//Screams Route
app.get('/getscreams', FBAuth, getAllScreams)
app.post('/insertscreams', FBAuth, insertScream)
app.get('/scream/:screamId', getScream);
app.delete('/scream/:screamId',FBAuth,deleteScream)
//Todo delete scream
//Todo like a scream
// unliking scream
// comment on scream
app.get('/scream/:screamId/like', FBAuth, likeScream);
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream);

app.post('/scream/:screamId/comment', FBAuth, commentOnScream)

//signUp route
app.post('/signup', signup)
app.post('/login', login)
app.post('/user/image', FBAuth, uploadImage)
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser)



exports.api = functions.https.onRequest(app);
