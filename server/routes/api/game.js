const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = require('../../models/User')
const Game = require('../../models/Game')
const nanoid = require('nano-id')
const isDev = process.env.NODE_ENV !== 'production';





// console.log(process.env.NODE_ENV)
router.get('/checkvalid',(req,res,next)=>{
    
    User.findById(req.user.id)
        .exec()
        .then((user)=>{
            if(user.valid){
                res.json({valid:true});
            }else{
                res.json({
                        valid:false,
                        game:user.game
                })
            }
        })
})

router.put('/join',(req,res,next)=>{
    // console.log(req.body)
    Game.findById(req.body.id)
        .exec()
        .then((game)=>{
            // console.log(game)
            Game.find({_id:req.body.id,'players.playerid':req.user._id})
                .exec()
                .then((play)=>{
                    if(!play.length){
                        const player = {
                            playerid:req.user._id,
                            playername:req.user.username,
                            active:true
                        }
                        game.players.push(player);
                        game.save()
                            .then(()=>{
                                User.findById(req.user._id)
                                .exec()
                                .then((user)=>{
                                    user.valid = false;
                                    user.game = game._id;
                                    user.save()
                                        .then(()=>{
                                                res.sendStatus(200);
                                        })
                                })
                            })
                    }else{
                        res.sendStatus(200);
                    }
                })

        })
})

router.put('/details',(req,res,next)=>{

    Game.findById(req.body.id)
        .exec()
        .then((game)=>{
            res.json({
                gamename:game.name,
                isDev:isDev
                // username:req.user.username,
                // playerid:req.user._id,
                // gameid:game._id
            })
        })
})

router.post('/creategame',(req,res,next)=>{
    
    User.findById(req.user.id)
        .exec()
        .then((user)=>{
            if(user.valid){
                var game = new Game;
                game.name = req.body.name;
                req.body.Private? game.private = true:game.private = false;
                game.mainroom = nanoid()
                game.save()
                    .then(() =>{
                        // user.valid = false;
                        // user.game = game._id;
                        // user.save()
                        //     .then(()=>{
                                console.log(game._id);
                                res.json({valid:true,game:game._id})
                            // })
                    } )
                    .catch((err) => next(err));  
                
            }else{
                res.json({
                        valid:false,
                        game:user.game
                })
            }
        })
})



module.exports = router








