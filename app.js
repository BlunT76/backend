const express = require('express');
const expressSession = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

const { validationResult } = require('express-validator/check');

const v = require('./validations');
const getAllPoi = require('./request/getAllPoi');
const getFilteredPoi = require('./request/getFilteredPoi');
const deletePoi = require('./request/deletePoi');
const addPoi = require('./request/addPoi');

const port = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(expressSession({ secret: 'max', saveUninitialized: false, resave: false }));
app.use(bodyParser.urlencoded({ extended: true }));

// gere le cors
app.options('/*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://ac845e0d.ngrok.io');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.sendStatus(200);
});
// page d'accueil: affiche tous les poi
app.get('/', async (req, res) => {
  const poi = await getAllPoi();
  res.render('index', { poi, success: false });
});

// retourne tous les poi en json
app.get('/poiall', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  const poi = await getAllPoi();
  return res.json(poi);
});

// retourne la liste des poi en json par rapport a une latlng et distancemax donnée
// /poi?lat=0.5757474&lng=44.86658&dist=1000
app.get('/poi', async (req, res) => {
  if (req.query.lat && req.query.lng && req.query.dist) {
    const poi = await getFilteredPoi(req.query.lat, req.query.lng, req.query.dist);
    return res.json(poi);
  }
  return null;
});

// newpoi page, for adding a new poi
app.get('/newpoi', (req, res) => {
  req.session.errors = null;
  res.render('newpoi', {
    errors: req.session.errors,
    data: req.body,
    success: false,
  });
});

// addpoi insert the new poi to the database
app.post('/addpoi/', v.validateMeChecks, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.session.errors = errors.array();
    res.render('newpoi', {
      errors: req.session.errors,
      data: req.body,
      success: false,
    });
  } else {
  // genere la date actuelle au format UTC
    const d = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

    // cree l'objet postPoi avecle contenu des inputs de newpoi
    const postPoi = {
      name: req.body.name,
      loc: { type: 'Point', coordinates: [Number(req.body.longitude), Number(req.body.latitude)] },
      date: d,
    };

    // se connecte a la database
    await addPoi(postPoi);
    res.render('newpoi', {
      errors: req.session.errors,
      data: req.body,
      success: true,
    });
  }
});

// Remove Poi
app.get('/delete/:id', (req, res) => {
  deletePoi(req.params.id);
  res.redirect('/');
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
