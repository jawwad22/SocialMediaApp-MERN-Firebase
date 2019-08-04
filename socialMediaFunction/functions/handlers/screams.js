const { db } = require('../util/admin');

exports.getAllScreams = (req, res) => {
    db.collection('screams')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let screams = [];
            data.forEach(doc => {
                screams.push(
                    {
                        screamId: doc.id,
                        body: doc.data().body,
                        userHandle: doc.data().userHandle,
                        createdAt: doc.data().createdAt,
                        commentCount: doc.data().commentCount,
                        likeCount: doc.data().likeCount
                    }
                );
            })
            console.error(screams)
            return res.json(screams);
        })
        .catch(err => {
            console.error(err)
            return res.json(err);

        })
}

exports.insertScream = (req, res) => {
    if (req.method !== "POST") {
        return res.status(400).json({ err: "Method not allowed" });
    }
    const newScream = {
        body: req.body.body,
        userHandle: req.body.handle,
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
};

exports.getScream = (req, res) => {
    let screamData = {};
    db.doc(`/screams/${req.params.screamId}`).get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: "Scream not found" })
            }
            screamData = doc.data();
            screamData.screamId = doc.id;
            return db.collection('comments')
                .orderBy('createdAt', 'desc')
                .where('screamId', '==', req.params.screamId).get()
                .then(data => {
                    screamData.comments = [];
                    data.forEach(doc => {
                        screamData.comments.push(doc.data())
                    });
                    return res.json(screamData)
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: err.code });
                })

        })
};

//comment o scream
exports.commentOnScream = (req, res) => {
    if (req.body.body.trim() === '') {
        return res.status(400).json({ error: 'Must not be empty' });
    }
    const newComment = {
        body: req.body,
        createdAt: new Date().toString(),
        screamId: req.params.screamId,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl
    };
    db.doc(`/screams/${req.params.screamId}`).get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Scream not found' });
            }
            return db.collection('comments').add(newComment);
        })
        .then(() => {
            res.json(newComment);
        }).catch(err => {
            console.log(err);
            res.status(500).json({ error: err })
        })
}
