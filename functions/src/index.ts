import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true });
  response.json({ msg: 'Hello Alex from Firebase!' });
});

export const getQueryName = functions.https.onRequest((request, response) => {
  const name = request.query.name || 'No name';
  response.json({
    name,
  });
});

export const getGoty = functions.https.onRequest(async (request, response) => {
  const gotyRef = db.collection('goty');
  const docsSnap = await gotyRef.get();
  const games = docsSnap.docs.map((doc) => doc.data());

  response.json(games);
});

// Express
const app = express();
app.use(cors({ origin: true }));

app.get('/goty', async (req, res) => {
  const gotyRef = db.collection('goty');
  const docsSnap = await gotyRef.get();
  const games = docsSnap.docs.map((doc) => doc.data());

  res.json(games);
});

app.post('/goty/:id', async (req, res) => {
  const id = req.params.id;
  const gameRef = db.collection('goty').doc(id);
  const gameSnap = await gameRef.get();
  if (!gameSnap.exists) {
    res.status(404).json({
      ok: false,
      msg: `There are no games with the id ${id}`,
    });
  } else {
    const before = gameSnap.data();
    await gameRef.update({
      votes: before?.votes + 1,
    });
    res.json({
      ok: true,
      msg: `Thank for your vote ${before?.name}`,
    });
  }
});

export const api = functions.https.onRequest(app);
