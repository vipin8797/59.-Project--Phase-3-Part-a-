//Requiring Dependencies
const express = require('express');
const router = express.Router({mergeParams:true});
const User = require('../models/user'); //user Model.
const methodOverride = require('method-override'); //method override fot put,patch,delete req
const ExpressError = require("../utils/ExpressError"); //ExpressError for custom Error class
const wrapAsync = require('../utils/wrapAsync'); //wrapAsync for default erro handling minddleware
const passport = require('passport'); //passport for authentication while login.
const{isLoggedIn,saveRedirectUrl} = require('../middleware');// isLoggedIn middl to check if user is loggedin or not
router.use(methodOverride('_method')); //method overide

//signUp get req
 router.get('/signUp',(req,res,next)=>{
    res.render('users/signup.ejs');
 });

 //post for user
 router.post('/signUp',wrapAsync(async(req,res,next)=>{
    try{
        const{username,email,password} = req.body;
        const newUser = await new User({email,username});
        const registerdUser = await User.register(newUser,password);
        req.login(registerdUser,(err)=>{ //login after signup.
            if(err) return next(err);
            req.flash('success',`Welcome "${username}"`);
            res.redirect('/listings')
        });
        // console.log(registerdUser); 
    }catch(err){
        req.flash('warning',err.message);
        res.redirect('/user/signUp');
    }
}));




 //get for login
 router.get('/login',(req,res,next)=>{
    res.render('users/login.ejs');
 })

//post for login
router.post('/login',saveRedirectUrl,
    passport.authenticate('local', {   // Passport's local strategy
        failureRedirect: '/user/login',      // Redirect to login page on failure
        failureFlash: true,             // Flash failure message
    }),
    async (req, res, next) => {
        req.flash('success', `Welcome back!`);  // Flash success message
       const redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);              // Redirect to listings page on successful login
    }
);


// probele causeing red erro in terminal.
// router.get('/logout',isLoggedIn,async(req,res,next)=>{
//     req.logout((err)=>{
//         return next(err);
//     });
//     res.redirect('/listings');
//     req.flash('success',"Logged Out successfully.");
// }) 

router.get('/logout', isLoggedIn, async (req, res, next) => {
    req.logout(err => {
        if (err) return next(err); // Handle logout error
        req.flash('success', "Logged Out successfully."); // Set flash message
        res.redirect('/listings'); // Redirect after logout
    });
});

module.exports = router;