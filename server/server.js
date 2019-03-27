const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

// Express...
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static('../public'));

// Database...
mongoose.connect('mongodb://localhost:27017/CP_4', {
  useNewUrlParser: true
});

const linkSchema = new mongoose.Schema({
  _id: String,
  link: String,
});

linkSchema.virtual('shortcut').get(function() {
    return this._id;
});

const Lookup = mongoose.model('Lookup', linkSchema);

app.post('/upload', async (req, res) => {
  const lookup = new Lookup({
    _id: req.body.shortcut,
    link: req.body.link,
  });

  try {
    await lookup.save();
    res.send(lookup);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
  console.log(lookup);
});

// URL fowarding
app.get('/:shortcut', async (req, res) => {
    const lookup = await Lookup.findOne({
      _id: req.params.shortcut
    });
    console.log(lookup);
    res.send(lookup);
});

app.listen(3000, () => console.log('Server listening on port 3000!'));
