var express = require("express");
var router = express.Router({mergeParams: true});
var Restaurant = require("../models/restaurant");
var Comment = require("../models/comment");
var middleware = require("../middleware");


//comments routes

router.get("/new", middleware.isLoggedIn,  function(req, res){
    Restaurant.findById(req.params.id, function(err, restaurant){
        if(err){
            res.redirect("restaurants/");
        }else {
            res.render("comments/new", {restaurant: restaurant});
        }
    });
});

router.post("/", middleware.isLoggedIn, function(req, res){
    Restaurant.findById(req.params.id, function(err, restaurant){
       if(err){
           console.log(err);
           res.redirect("/restaurants");
       }else{
           Comment.create(req.body.comment, function(err, comment){
               if(err){
                   console.log(err);
               }else {
                   comment.author.id = req.user._id;
                   comment.author.username = req.user.username;
                   comment.save();
                   restaurant.comments.push(comment);
                   restaurant.save();
                   req.flash("success", "Successfully added a comment!");
                   res.redirect("/restaurants/" + restaurant._id);
               }
           });
       }
   });
});

//edit comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Restaurant.findById(req.params.id, function(err, foundRestaurant){
       if(err || !foundRestaurant){
           return res.redirect("back");
       } 
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        }else {
            
             res.render("comments/edit",  {campground_id: req.params.id, comment: foundComment});
        }
        
        });
    });
});


//commnet update 
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        }else {
            req.flash("success", "Successfully updated!");
            res.redirect("/restaurants/" + req.params.id);
        }
    });
});

//comment destry
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       }else {
           req.flash("success", "Successfully deleted!");
           res.redirect("/restaurants/" + req.params.id);
       }
   });
});

module.exports = router;

