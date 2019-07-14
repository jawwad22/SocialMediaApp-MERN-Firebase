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
});

const isEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(emailRegEx)) return true;
    else return false;
}

const isEmpty = (string) => {
    if (string.trim() === '') return true
    else return false
}
//signUp route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };
    let errors = {};

    if (isEmpty(newUser.email)) {
        errors.email = "Email must not be empty"
    } else if (!isEmail(newUser.email)) {
        errors.email = 'Must be a valid email address'
    }

    if (isEmpty(newUser.password)) errors.password = "Must not empty"
    if (newUser.password !== newUser.confirmPassword) errors.confirmPassword = "Passwords must match";
    if (isEmpty(newUser.handle)) errors.handle = "Must not be empty";

    if (Object.keys(errors).length > 0) return res.status(400).json(errors);
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

app.post('/login', (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    let errors = {};

    if (isEmpty(user.email)) errors.email = "Must not be empty";
    if (isEmpty(user.password)) errors.password = "Must not be Empty";

    if (Object.keys(errors).length > 0) return res.status(400).json(errors);

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res.json({ token });
        })
        .catch(err => {
            console.log(err);
            if (err.code === 'auth/wrong-password') {
                return res.status(403).json({
                    general: "wrong credential please try again"
                })
            }
            else {
                return res.status(500).json({ error: err.code });
            }
        })
})

exports.api = functions.https.onRequest(app);
