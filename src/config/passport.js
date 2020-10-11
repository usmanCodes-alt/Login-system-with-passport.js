const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");
const bcrypt = require("bcrypt");

function initialize(passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          // find user
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, { message: "Email does not exists" });
          }
          // match password
          if (!(await bcrypt.compare(password, user.password))) {
            return done(null, false, {
              message: "Email or password incorrect",
            });
          }
          return done(null, user);
        } catch (error) {
          console.log(error);
          done(error);
        }
      }
    )
  );
  passport.serializeUser((user, done) => {
    return done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    return done(null, user);
  });
}

module.exports = initialize;
