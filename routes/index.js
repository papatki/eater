var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");





//index routes
router.get("/", function(req, res){
   res.render("landing");
});
//sing up routes

router.get("/register", function(req, res){
    res.render("register");
});

router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Eater " + user.username + ".");
            res.redirect("/restaurants");
        });
    });
});

//login logic
router.get("/login", function(req, res){
    res.render("login");
});

router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/restaurants",
        failureRedirect: "/login"
    
    }), function(req, res){
});

//logout lroute
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Successfully logged out.");
    res.redirect("/restaurants");
});


module.exports = router;