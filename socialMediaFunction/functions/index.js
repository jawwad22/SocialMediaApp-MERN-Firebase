const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const { db } = require('./util/admin')

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
    getAuthenticatedUser, 
    getUserDetails,
    markNotificationsRead
} = require('./handlers/user')

//Screams Route
app.get('/getscreams', FBAuth, getAllScreams)
app.post('/insertscreams', FBAuth, insertScream)
app.get('/scream/:screamId', getScream);
app.delete('/scream/:screamId', FBAuth, deleteScream)
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
app.get('/user/:handle', getUserDetails);
app.post('/notifications', FBAuth, markNotificationsRead);

exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.region('europe-west1').firestore.document('likes/{id}')
    .onCreate((snapshot) => {
        db.doc(`/screams/${snapshot.data().screamId}`).get()
            .then(doc => {
                if (doc.exists) {
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: 'like',
                        read: false,
                        screamId: doc.id
                    })
                }

            })
            .then(() => {
                return;
            }).catch(err => {
                console.error(err);
                return;
            })
    })

exports.deleteNotificationOnLike =
    functions.region('europe-west1')
        .firestore.document('likes/{id}')
        .onDelete((snapshot) => {
            db.doc(`notifications/${snapshot.id}`)
                .delete()
                .then(() => {
                    return;
                })
                .catch((err) => {
                    console.error(err);
                    return
                })
        })

exports.createNotificationOnComment = functions.region('europe-west1')
    .firestore.document('comments/{id}')
    .onCreate((snapshot) => {
        db.doc(`/screams/${snapshot.data().screamId}`).get()
            .then(doc => {
                if (doc.exists) {
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: 'comment',
                        read: false,
                        screamId: doc.id
                    })
                }

            })
            .then(() => {
                return;
            }).catch(err => {
                console.error(err);
                return;
            })
    })