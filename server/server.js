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

const cookieParser = require("cookie-parser");
app.use(cookieParser());

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

// Saves a relation between a shortend url and full url.
app.post('/upload', async (req, res) => {
  const lookup = new Lookup({
    _id: req.body.shortcut,
    link: req.body.link,
  });

  // TODO: regix? (low priority)
  // Check proper url syntax ??? Maybe it's best to assume
  // they will enter the correct link.
  var http = "http://";
  var https = "https://";
  lookup.link = lookup.link.replace(http, '');
  lookup.link = lookup.link.replace(https, '');

  try {
    await lookup.save();
    res.send(lookup);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.get('/upload', async (req, res) => {
	  try {
		      let lookups = await Lookup.find();
		      res.send(lookups);
		    } catch (error) {
			        console.log(error);
			        res.sendStatus(500);
			      }
});

//edit lookup
app.put('/upload/:id', async (req, res) => {
  let id = req.params.id;
  try {
    let lookup = await Lookup.findOne({
      _id: id
    });

    console.log(lookup);

    await Lookup.deleteOne({
      _id: id
    });

    const lookup1 = new Lookup({
      _id: req.body.id,
      link: req.body.link,
    });

    console.log(lookup1);

    await lookup1.save();
    res.send(lookup1);

  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

//deletes specific lookups
app.delete('/upload/:id', async (req, res) => {
  let id = req.params.id;
  try {
    await Lookup.deleteOne({
      _id: id
    });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }

});

const users = require("./users.js");
app.use("/api/users", users);

// Fowards tiny url to actual url.
app.get('/:shortcut', async (req, res) => {
  const lookup = await Lookup.findOne({
    _id: req.params.shortcut
  });

  var html = '';
  if (lookup == null) {
    // TODO: Add error message pop up on main site. (medium priority)
    var host = req.headers.host;
    html = "<head><meta charset=\"UTF-8\"> <title>Redirect</title>";
    html += "<script type=\"text/javascript\">window.location.href = \"http://" + host + "\"</script>";
    html += "<noscript>ShortLinks requires Javascript to run, Please turn Javascript.</noscript>"
    html += "</head>";
  } else {
    html = "<head><meta charset=\"UTF-8\"> <title>Redirect</title>";
    html += "<script type=\"text/javascript\">window.location.href = \"http://" + lookup.link + "\"</script>";
    html += "<noscript>ShortLinks requires Javascript to run, Please turn Javascript.</noscript>"
    html += "</head>";
  }

  res.send(html);
});

app.listen(3001, () => console.log('Server listening on port 3001!'));
