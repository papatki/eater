var express = require("express");
var router = express.Router();

var Restaurant = require("../models/restaurant");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);




//restaurants routes


router.get("/", function(req, res) {
    var noMatch = null;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Restaurant.find({ $or: [{ name: regex }, { tags: regex }, { location: regex }] }, function(err, allRestaurants) {
            if (err) {
                console.log(err);
            }
            else {

                if (allRestaurants.length < 1) {
                    noMatch = "No match results.";
                }
                res.render("restaurants/index", { restaurants: allRestaurants, currentUser: req.user, noMatch: noMatch });
            }
        });
    }
    else {
        Restaurant.find({}, function(err, allRestaurants) {
            if (err) {
                console.log(err);
            }
            else {
                res.render("restaurants/index", { restaurants: allRestaurants, currentUser: req.user, noMatch: noMatch });
            }
        });
    }

});

router.post("/", middleware.isLoggedIn, function(req, res) {
    var name = req.body.name;
    var image = req.body.image;
    var openingHours = req.body.openingHours;
    var tags = req.body.tags;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    geocoder.geocode(req.body.location, function(err, data){
        if(err || !data.length) {
            console.log(err);
            req.flash("error", "Invalid address.");
            return res.redirect("back");
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newRestaurant = { name: name, image: image, openingHours: openingHours, tags: tags, description: desc, author: author, location: location, lat: lat, lng: lng };
        Restaurant.create(newRestaurant, function(err, newlyCreated) {
            if (err) {
                console.log(err);
            }
            else {
                req.flash("success", "Successfully added new place!");
                res.redirect("/restaurants");
            }
        });
    });
});

router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("restaurants/new");
});

router.get("/:id", function(req, res) {
    Restaurant.findById(req.params.id).populate("comments").exec(function(err, foundRestaurant) {
        if (err || !foundRestaurant) {
            res.redirect("/restaurants");
        }
        else {
            res.render("restaurants/show", { restaurant: foundRestaurant });
        }
    });


});


router.get("/:id/edit", middleware.checkRestaurantOwnership, function(req, res) {
    Restaurant.findById(req.params.id, function(err, foundRestaurant) {
        if (err) {
            res.redirect("back");
        }
        res.render("restaurants/edit", { restaurant: foundRestaurant });
    });
});

router.put("/:id", middleware.checkRestaurantOwnership, function(req, res) {
    geocoder.geocode(req.body.location, function(err, data){
        if(err || !data.length){
            console.log(err);
            req.flash("error", "Invalid address.");
            return res.redirect("back");
        }
        req.body.restaurant.lat = data[0].latitude;
        req.body.restaurant.lng = data[0].longitude;
        req.body.restaurant.location = data[0].formattedAddress;
        Restaurant.findByIdAndUpdate(req.params.id, req.body.restaurant, function(err, updatedRastaurant) {
            if (err) {
                console.log(err);
                res.redirect("/restaurants");
            }
            else {
                req.flash("success", "Successfully updated!");
                res.redirect("/restaurants/" + req.params.id);
            }
        });
    });
});


router.delete("/:id", middleware.checkRestaurantOwnership, function(req, res) {
    Restaurant.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/restaurants");
        }
        else {
            req.flash("success", "Successfully deleted.");
            res.redirect("/restaurants");
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}



module.exports = router;
