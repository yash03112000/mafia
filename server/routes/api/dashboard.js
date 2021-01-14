const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = require('../../models/User')
const Game = require('../../models/Game')






router.get('/details',(req,res,next)=>{
    if(req.user.valid){
        Game.find({private:false})
            .select('_id name')
            .exec()
            .then((games)=>{
                console.log(games);
                res.json({
                    username:req.user.username,
                    valid:req.user.valid,
                    games:games     
                })
            })

    }else{
        Game.findById(req.user.game)
            .exec()
            .then((game)=>{
                res.json({
                    username:req.user.username,
                    valid:req.user.valid,
                    game:req.user.game,
                    name:game.name     
                })
            })

    }



})



module.exports = router








