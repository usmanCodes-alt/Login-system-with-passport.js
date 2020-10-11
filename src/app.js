const express = require("express");
const User = require("./models/user");
const validator = require("validator");
const passport = require("passport");
const session = require("express-session");
const app = express();
const { isAuthenticated, isNotAuthenticated } = require("./config/auth");
require("./db/mongoose");
require("./config/passport")(passport);
const port = 3000 || process.env.PORT;

app.use(
  session({
    secret: "thisissecret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");
//app.use(express.bodyParser());
app.use(express.urlencoded({ extended: false })); // so we can get data from our form using req.body
app.use("/public", express.static("public"));

app.get("/", isNotAuthenticated, (req, res) => {
  res.render("../public/views/login");
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/",
  })(req, res, next);
});

app.get("/register", isNotAuthenticated, (req, res) => {
  res.render("../public/views/register");
});

app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, password, confirmPassword, email } = req.body;
    if (!firstName || !lastName || !password || !confirmPassword || !email) {
      return res.status(400).render("../public/views/register.ejs", {
        error: true,
        message: "Please provide all the information.",
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).render("../public/views/register.ejs", {
        error: true,
        message: "Passwords don't match.",
      });
    }
    if (password.length < 7) {
      return res.status(401).render("../public/views/register.ejs", {
        error: true,
        message: "Password should has atleast 7 characters",
      });
    }
    if (password.toLowerCase().includes("password")) {
      return res.status(401).render("../public/views/register.ejs", {
        error: true,
        message: "Passwords too weak.",
      });
    }
    if (!validator.isEmail(email)) {
      return res.status(401).render("../public/views/register.ejs", {
        error: true,
        message: "Invalid Email.",
      });
    }
    //find duplicate user
    const duplicateUser = await User.findOne({ email });
    if (duplicateUser) {
      return res.status(400).render("../public/views/register.ejs", {
        error: true,
        message: "Email already taken.",
      });
    }
    const user = new User({
      firstName,
      lastName,
      email,
      password,
    });
    await user.save();
    return res.status(201).redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
});

app.get("/home", isAuthenticated, (req, res) => {
  res.render("../public/views/home.ejs");
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
