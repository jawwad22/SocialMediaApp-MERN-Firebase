const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp();
var firebaseConfig = {
    apiKey: "AIzaSyDHzp-Vi8qPPeIe-P2PwSU2Zar0yMfeC0g",
    authDomain: "socialmediaapp-d6926.firebaseapp.com",
    databaseURL: "https://socialmediaapp-d6926.firebaseio.com",
    projectId: "socialmediaapp-d6926",
    storageBucket: "socialmediaapp-d6926.appspot.com",
    messagingSenderId: "77907472095",
    appId: "1:77907472095:web:fda828178be5d931"
};
// Initialize Firebase

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get('/getscreams', (req, res) => {
    db
        .collection('screams')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let screams = [];
            data.forEach(doc => {
                screams.push(
                    {
                        screamId: doc.id,
                        body: doc().body,
                        userHandle: doc.data().userHandle,
                        createdAt: doc().createdAt,
                        commentCount: doc.data().commentCount,
                        likeCount: doc.data().likeCount
                    }
                );
            })
            return res.json(screams);
        })
        .catch(err => {
            console.error(err)
        })
})

app.post('/insertscreams', (req, res) => {
    if (req.method !== "POST") {
        return res.status(400).json({ err: "Method not allowed" });
    }
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()//admin.firestore.Timestamp.fromDate(new Date())
    };

    db
        .collection('screams')
        .add(newScream)
        .then(doc => {
            res.json({ message: `document ${doc.id} creted sucessfully` })
        })
        .catch(err => {
            res.status(500).json({ error: 'Something Went Wrong' })
            console.error(err)
        })
})
//signUp route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    }
    // TODO validate data
    let token, userId;
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if (doc.exists) {
                return res.status(400).json({
                    handle: 'this handle is already taken'
                })
            }
            else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
        })
        .then(data => {
            userId = data.user.uid
            return data.user.getIdToken();
        })
        .then(tokenId => {
            token = tokenId;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
            // return res.status(201).json({ token })
        }).then(() => {
            return res.status(201).json({ token })
        })
        .catch(err => {
            console.error(err)
            return res.status(500).json({ error: err.code })
        })


})


exports.api = functions.https.onRequest(app);
