const passport = require('passport');
const express = require('express');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');


const tokenList = {};
const router = express.Router();

router.get('/status', (req, res, next) => {
  res.status(200).json({ status: 'ok' });
});

router.post('/signup', passport.authenticate('signup', { session: false }), async (req, res, next) => {
  res.status(200).json({ message: 'signup successful' });
});


router.get('/scores', async (req, res, next) => {
  const users = await UserModel.find({}, 'name highScore -_id').sort({ highScore: -1 }).limit(10);
  res.status(200).json(users);
});

router.post('/login-without-account', async (req, res, next) => {  
  const token = jwt.sign({ user: req.body.username }, 'top_secret', { expiresIn: 300 });
  const refreshToken = jwt.sign({ user: req.body.username }, 'top_secret_refresh', { expiresIn: 86400 });

  // store tokens in cookie
  res.cookie('jwt', token);
  res.cookie('refreshJwt', refreshToken);

  // store tokens in memory
  tokenList[refreshToken] = {
    token,
    refreshToken,
    email: "",
    _id: "",
  };

  //Send back the token to the user
  return res.status(200).json({ token, refreshToken });
});

router.post('/login', async (req, res, next) => {
  passport.authenticate('login', async (err, user, info) => {
    try {
      if (err || !user) {
        const error = new Error('An Error occured');
        return next(error);
      }
      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);
        const body = {
          _id: user._id,
          email: user.email
        };

        const token = jwt.sign({ user: body }, 'top_secret', { expiresIn: 300 });
        const refreshToken = jwt.sign({ user: body }, 'top_secret_refresh', { expiresIn: 86400 });

        // store tokens in cookie
        res.cookie('jwt', token);
        res.cookie('refreshJwt', refreshToken);

        // store tokens in memory
        tokenList[refreshToken] = {
          token,
          refreshToken,
          email: user.email,
          _id: user._id
        };

        //Send back the token to the user
        return res.status(200).json({ token, refreshToken });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

router.post('/token', (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken in tokenList) {
    const body = { email: tokenList[refreshToken].email, _id: tokenList[refreshToken]._id };
    const token = jwt.sign({ user: body }, 'top_secret', { expiresIn: 300 });

    // update jwt
    res.cookie('jwt', token);
    tokenList[refreshToken].token = token;

    res.status(200).json({ token });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

router.get('/users', async (req, res) => {
  UserModel.find({}, function (err, users) {
    if (err) {
      res.send('something went really wrong!!');
      next();
    }
    res.json(users);
  });
});

router.post('/submit-score', async (req, res, next) => {
  const { email, score } = req.body;
  await UserModel.updateOne({ email }, { highScore: score });
  res.status(200).json({ status: 'ok' });
});

router.post('/submit-element', async (req, res, next) => {
  const { email, element } = req.body;
  await UserModel.updateOne({ email }, { bestElement: element });
  res.status(200).json({ status: 'ok' });
});

router.post('/submit-kills', async (req, res, next) => {
  const { email, kills } = req.body;
  await UserModel.updateOne({ email }, { kills: kills });
  res.status(200).json({ status: 'ok' });
});

router.get('/get-user', async (req, res, next) => {
  const email = req.query["email"];
  await UserModel.find({email: email}, function (err, users) {
    if (err) return handleError(err);
    res.send(users)
  });

});

router.post('/logout', (req, res, next) => {
if (req.cookies) {
    console.log(req.cookies);
    const refreshToken = req.cookies['refreshJwt'];
    if (refreshToken in tokenList) {
      delete tokenList[refreshToken];
    } 
    res.clearCookie('refreshJwt');
    res.clearCookie('jwt');
    console.log("Logged Out!!")
  }
  res.status(200).json({ message: 'logged out' });
});

module.exports = router;
