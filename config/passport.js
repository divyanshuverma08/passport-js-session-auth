var passport = require('passport');
var LocalStrategy = require('passport-local');
const userModel = require('../models/userModel');
const { compareSync } = require('bcrypt');

passport.use(new LocalStrategy(
   async function(username, password, done) {
    try{
      let user = await userModel.findOne({ username: username })
      if (!user) { return done(null, false); }
      if (!compareSync(password,user.password)) { return done(null, false); }
      return done(null, user);

    }catch(err){
      console.log(err);
    }
    }
));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture
    });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});