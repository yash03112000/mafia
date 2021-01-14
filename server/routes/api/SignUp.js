const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = require('../../models/User')
var bcrypt = require('bcryptjs');




router.post('/',(req,res,next)=>{
    User.findOne({username:req.body.username})
        .exec()
        .then((user) => {
            // console.log(user)
            if(user){
                console.log('Already Exist Will Put In React after Better Forms')
                res.redirect('/');  
            } 
            else{

                bcrypt.genSalt(10, (err, salt)=>{
                    bcrypt.hash(req.body.password, salt, (err, hash)=>{
                        // Store hash in your password DB.
                        var newuser = new User;
                        newuser.username = req.body.username;
                        newuser.password = hash;
                        newuser.save()
                            .then(() =>{res.sendStatus(200);console.log('Added')} )
                            .catch((err) => next(err))
                    });
                });

            }
        })

        .catch((err) => next(err));
})



module.exports = router








