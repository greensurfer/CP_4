const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

let secret = "RANDOMSECRETCHANGETHIS";

if (secret === undefined) {
  console.log("You need to define a jwtSecret environment variable to continue.");
  mongoose.connection.close();
  process.exit();
}

// Generate a token
const generateToken = (data, expires) => {
  return jwt.sign(data, secret, {
    expiresIn: expires
  });
};

// Verify the token that a client gives us.
// This is setup as middleware, so it can be passed as an additional argument to Express after
// the URL in any route. This will restrict access to only those clients who possess a valid token.
const verifyToken = (req, res, next) => {
  const token = req.cookies["token"];
  if (!token) return res.status(403).send({
    message: "No token provided."
  });
  try {
    const decoded = jwt.verify(token, secret);
    // save user id
    req.user_id = decoded.id;
    req.token = token;
    next();

  } catch (error) {
    console.log(error);
    return res.status(403).send({
      message: "Failed to authenticate token."
    });
  }
}

const isLoggedIn = (req, res, next) => {
  const token = req.cookies["token"];
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, secret);
    // save user id
    req.user_id = decoded.id;
    req.token = token;
    return true;

  } catch (error) {
    console.log(error);
    return false;
  }
}

const removeOldTokens = (tokens) => {
  return tokens.filter(token => {
    try {
      jwt.verify(token, secret);
      return true;
    } catch (error) {
      return false;
    }
  });
}

module.exports = {
  generateToken: generateToken,
  verifyToken: verifyToken,
  removeOldTokens: removeOldTokens,
  isLoggedIn: isLoggedIn,
};
