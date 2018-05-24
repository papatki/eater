require("dotenv").config();
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var localStrategy = require("passport-local");
var methodOverride = require("method-override");
var User = require("./models/user");


var commentRoutes = require("./routes/comments");
var restaurantsRoutes = require("./routes/restaurants");
var indexRoutes = require("./routes/index");
var contactRoutes = require("./routes/contact");



mongoose.connect(process.env.DATABASEURL);


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

app.use(require("express-session")({
    secret: "Something",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.locals.moment = require("moment");



app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});


app.use(indexRoutes);
app.use("/restaurants", restaurantsRoutes);
app.use("/restaurants/:id/comments", commentRoutes);
app.use("/contact", contactRoutes);

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server has started.");
});
