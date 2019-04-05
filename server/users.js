const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const auth = require("./auth.js");

const SALT_WORK_FACTOR = 10;

const userSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    tokens: [],
    shortcuts: [],
});

const linkSchema = new mongoose.Schema({
    _id: String,
    link: String,
    loggedin: Boolean,
    timestamp: Number,
});

/*
 * Hook the "save" function in mongose.
 */
userSchema.pre('save', async function(next) {
    // only hash the password if it has been modified (or is new)
    if (!this.isModified('password'))
        return next();

    try {
        // generate a salt
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);

        // hash the password along with our new salt
        const hash = await bcrypt.hash(this.password, salt);

        // override the plaintext password with the hashed one
        this.password = hash;
        next();
    } catch (error) {
        console.log(error);
        next(error);
    }
});

userSchema.methods.comparePassword = async function(password) {
    try {
        const isMatch = await bcrypt.compare(password, this.password);
        return true;
    } catch (error) {
        return false;
    }
};

userSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    delete obj.tokens;
    return obj;
};

userSchema.methods.addToken = function(token) {
    this.tokens.push(token);
}

userSchema.methods.removeToken = function(token) {
    this.tokens = this.tokens.filter(t => t != token);
}

userSchema.methods.removeOldTokens = function() {
    this.tokens = auth.removeOldTokens(this.tokens);
}

userSchema.methods.addShortcut = function(shortcut) {
    this.shortcuts.push(shortcut);
}

userSchema.methods.removeShortcut = function(shorty) {
    this.shortcuts = this.shortcuts.filter(t => t.shortcut != shorty);
}

async function login(user, res) {
    let token = auth.generateToken({
        id: user._id
    }, "24h");

    user.removeOldTokens();
    user.addToken(token);
    await user.save();

    return res
        .cookie("token", token, {
            expires: new Date(Date.now() + 86400 * 1000)
        })
        .status(200).send(user);
}

// create a new user
router.post('/', async (req, res) => {
    if (!req.body.username || !req.body.password)
        return res.status(400).send({
            message: "username and password are required"
        });

    try {

        //  check to see if username already exists
        const existingUser = await User.findOne({
            username: req.body.username
        });
        if (existingUser)
            return res.status(403).send({
                message: "username already exists"
            });

        // create new user
        const user = new User({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        });
        await user.save();
        console.log(user);
        login(user, res);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

// Logout
router.delete("/", auth.verifyToken, async (req, res) => {
    // look up user account
    const user = await User.findOne({
        _id: req.user_id
    });
    if (!user)
        return res.clearCookie('token').status(403).send({
            error: "must login"
        });

    user.removeToken(req.token);
    await user.save();
    res.clearCookie('token');
    res.sendStatus(200);
});

// Get current user if logged in.
router.get('/', auth.verifyToken, async (req, res) => {
    // look up user account
    const user = await User.findOne({
        _id: req.user_id
    });
    if (!user)
        return res.status(403).send({
            error: "must login"
        });

    return res.send(user);
});

// login
router.post('/login', async (req, res) => {
    if (!req.body.username || !req.body.password)
        return res.sendStatus(400);

    try {
        //  lookup user record
        const existingUser = await User.findOne({
            username: req.body.username
        });
        if (!existingUser)
            return res.status(403).send({
                message: "username or password is wrong"
            });

        // check password
        if (!await existingUser.comparePassword(req.body.password))
            return res.status(403).send({
                message: "username or password is wrong"
            });

        login(existingUser, res);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
});

// Uploading while logged in.
router.post('/upload', auth.verifyToken, async (req, res) => {

    lookup = new Lookup({
        _id: req.body.shortcut,
        link: req.body.link,
        loggedin: true,
        timestamp: Date.now(),
    });

    var http = "http://";
    var https = "https://";
    lookup.link = lookup.link.replace(http, '');
    lookup.link = lookup.link.replace(https, '');

    const user = await User.findOne({
        _id: req.user_id
    });

    if (!user)
        return res.status(403).send({
            error: "must login"
        });

    user.addShortcut({
        shortcut: lookup._id,
        link: lookup.link
    });

    try {
        await lookup.save();
        await user.save();
        res.send(lookup);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

// Delete shortcut.
router.delete('/upload/:id', auth.verifyToken, async (req, res) => {

    let id = req.params.id;
    let lookup = await Lookup.findOne({
        _id: id
    });

    await Lookup.deleteOne({
        _id: id
    });

    const user = await User.findOne({
        _id: req.user_id
    });

    user.removeShortcut(lookup._id);

    try {
        await user.save();
        res.send(user);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

//edit lookup
router.put('/upload/:id', auth.verifyToken, async (req, res) => {

  let id = req.params.id;
  try {
    let lookup = await Lookup.findOne({
      _id: id
    });

    await Lookup.deleteOne({
      _id: id
    });

    const lookup1 = new Lookup({
      _id: req.body.shortcut,
      link: req.body.link,
      loggedin: true,
      timestamp: Date.now(),
    });

    const user = await User.findOne({
        _id: req.user_id
    });

    user.removeShortcut(id);
    user.addShortcut({
            shortcut: lookup1._id,
            link: lookup1.link
    });

    await lookup1.save();
    await user.save();
    res.send(lookup1);

  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// want to make sure all methods are attached before we atach to model.
const User = mongoose.model('User', userSchema);
const Lookup = mongoose.model('Lookup', linkSchema);

module.exports = {
    router: router,
    Lookup: Lookup,
}
