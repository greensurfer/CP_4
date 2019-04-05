const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const auth = require("./auth.js");

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

// Not logged in add shortcut.
app.post('/upload', async (req, res) => {
  const lookup = new Lookup({
    _id: req.body.shortcut,
    link: req.body.link,
    loggedin: false,
    timestamp: Date.now(),
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

const users = require("./users.js");
app.use("/api/users", users.router);

const Lookup = users.Lookup;

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
