var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Restaurant = require("../models/restaurant");


//index routes
router.get("/", function(req, res){
   res.render("landing");
});
//sing up routes

router.get("/register", function(req, res){
    res.render("register");
});

router.post("/register", function(req, res){
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
    });
    
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


//user profile routes
router.get("/users/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", "Something went wrong.");
            console.log(err);
            return res.redirect("/");
            
        }
        Restaurant.find().where('author.id').equals(foundUser._id).exec(function(err, restaurants){
            if(err) {
                req.flash("error", "Something went wrong.");
                console.log(err);
                return res.redirect("/");
            }
            res.render("users/show", {user: foundUser, restaurants: restaurants});
        });
    });
});

//user profile updating
router.get("/users/:id/edit", function(req, res) {
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            res.redirect("back");
        }
        res.render("users/edit", { user: foundUser});
    });
});

router.put("/users/:id", function(req, res){
    User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUserProfile){
        if(err) {
            console.log(err);
            res.redirect("/users/" + req.params.id);
            req.flash("error", "Something went wrong");
        }else {
            req.flash("success", "Successfully updated!");
            res.redirect("/users/" + req.params.id);
        }
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

//logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Successfully logged out.");
    res.redirect("/restaurants");
});
//forgot  route

router.get("/forgot", function(req, res) {
   res.render("forgot"); 
});

module.exports = router;