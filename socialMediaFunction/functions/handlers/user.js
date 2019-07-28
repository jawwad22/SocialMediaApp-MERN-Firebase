const { admin, db } = require('../util/admin');
const firebase = require('firebase');
const config = require('../util/config')

firebase.initializeApp(config)

const { validateSignupData, validateLoginData
    , reduceUserDetails } = require('../util/validators')
exports.signup = (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    const { valid, errors } = validateSignupData(newUser)
    if (!valid) return res.status(400).json(errors);

    const noImg = 'no-img.png'

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
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${
                    config.storageBucket
                    }/o/${noImg}?alt=media`,
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


}

exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };


    const { valid, errors } = validateLoginData(user)

    if (!valid) return res.status(400).json(errors);
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
}
//add User Details
exports.addUserDetails = (req, res) => {
    let userDetails = reduceUserDetails(req.body);

    db.doc(`/users/${req.user.handle}`).update(userDetails)
        .then(() => {
            return res.json({ message: 'Details added Successfully' });
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code })
        })
}

exports.uploadImage = (req, res) => {
    const BusBoy = require('busboy')
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busBoy = new BusBoy({
        headers: req.headers
    });
    let imageFileName;
    let imageToBeUploaded = {};
    busBoy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        //image .png

        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png' && mimetype !== 'image/jpg') {
            return res.status(400).json({
                error: 'Wrong file type submitted'
            });
        }


        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        // 32756238461724837.png
        imageFileName = `${Math.round(
            Math.random() * 1000000000000
        ).toString()}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));
    });
    busBoy.on('finish', () => {
        admin
            .storage()
            .bucket()
            .upload(imageToBeUploaded.filepath, {
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: imageToBeUploaded.mimetype
                    }
                }
            })
            .then(() => {
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${
                    config.storageBucket
                    }/o/${imageFileName}?alt=media`;
                return db.doc(`/users/${req.user.handle}`).update({ imageUrl });
            })
            .then(() => {
                return res.json({ message: 'image uploaded successfully' });
            })
            .catch((err) => {
                console.error(err);
                return res.status(500).json({ error: 'something went wrong' });
            });
    });
    busBoy.end(req.rawBody);
}; 