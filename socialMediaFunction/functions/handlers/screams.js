const {db}=require('../util/admin');

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

exports.insertScream=(req, res) => {
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
