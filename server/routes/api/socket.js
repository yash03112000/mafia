const moment = require('moment');
const mongoose = require('mongoose')
const Game = require('../../models/Game');
const Poll = require('../../models/Poll');
const User = require('../../models/User');
const isDev = process.env.NODE_ENV !== 'production';

const time10 = isDev?5:10;
const time60 = isDev?5:60;




const formatMessage = (username, text,id)=>{
  return {
      username,
      text,
      time: moment().format('h:mm a'),
      id:id
  };
  }
  const formatPoll = (username, text,id,usernames,options,pollid)=>{
    return {
        username,
        text,
        time: moment().format('h:mm a'),
        id:id,
        options:options,
        pollid,
        usernames
    };
    }  

  const {
    countPlayer,
    getMafiaFamCount,
    getmafiaTeamCode,
    mafiaTeamEntry,
    cityTeamEntry,
    findGodfather,
    findmafia,
    findwhite,
    findblack,
    findhealer,
    findcitizen
  } = require('./gamehelpers');


  const roles = (players)=>{
    //const user = getCurrentUser(socket.id);
    // players = getRoomUsers(user.room);
    // console.log(players)
    const MafiaFamCount = getMafiaFamCount(players.length);
    const CityFamCount = players.length - MafiaFamCount;
    // console.log(MafiaFamCount);
    // console.log(CityFamCount);
    const mafiaTeamCode = getmafiaTeamCode(MafiaFamCount,players.length);
    // console.log(mafiaTeamCode);
    const mafiaTeam = mafiaTeamEntry(players,mafiaTeamCode);
    const cityTeam = cityTeamEntry(players,mafiaTeamCode);
    // console.log(mafiaTeam);
    // console.log(cityTeam);
    const godfatherCode = getmafiaTeamCode(1,MafiaFamCount);
    // console.log(godfatherCode);
    const godFather = findGodfather(players,mafiaTeam,godfatherCode,mafiaTeamCode);
    // console.log(godFather);
    const mafia = findmafia(mafiaTeam,godfatherCode);
    // console.log(mafia);
    const CityCode = getmafiaTeamCode(3,CityFamCount);
    // console.log(CityCode);
    const white = findwhite(players,cityTeam,CityCode);
    // console.log(white);
    const black = findblack(players,cityTeam,CityCode);
    const healer = findhealer(players,cityTeam,CityCode);
    const citizen = findcitizen(cityTeam,CityCode);
    // console.log(citizen);

    return {mafiaTeam,cityTeam,godFather,mafia,white,black,healer,citizen}
}

const funwhite = (socket,io,game)=>{
  const username = socket.request.user.username;
  const room = socket.request.user.game;
  const playerid = socket.request.user._id;
  io.to(game.mainroom).emit('message',formatMessage('Admin' , 'White Detective Wake Up','admin'));
  if(game.white){
    var white = game.players.id(game.white);
    io.to(white.socketid).emit('wake');
    io.to(game.mainroom).emit('message',formatMessage('Admin' , 'You have 10 seconds','admin'));
    var i;
    var usernames = [];
    var pollarr = [];
    for(i=0;i<game.gameplayers.length;i++){
      var player = game.players.id(game.gameplayers[i]);
      // console.log(player)
      var a = {
        id:game.gameplayers[i],
        username:player.playername
      }
      pollarr.push({pid:game.gameplayers[i],count:0})
      usernames.push(a);
    }
    var poll = new Poll;
    poll.game = room;
    poll.nominated = pollarr;
  
    poll.save()
     .then((poll)=>{
        // console.log(usernames);
        Game.findOneAndUpdate({_id:room},
          {poll:poll._id},{useFindAndModify:false})
            .exec()
            .then((game)=>{
              var i;
              var player = game.players.id(game.white);
              // console.log(poll.nominated)
              io.to(player.socketid).emit('message',formatPoll('Admin' , 'Who To Check!','poll',usernames,poll.nominated,poll._id));                                                  
              sec = time10;
              const timer = setInterval(() => {
                io.to(game.mainroom).emit('timer',sec--);
                // console.log('timer')
                if(sec===-1){
                  clearInterval(timer);
                  // console.log('timerover')
                  var i;
                  var player = game.players.id(game.white);
                  io.to(player.socketid).emit('polltime',poll._id);
                  Game.findOneAndUpdate({_id:room},{stage:3},{useFindAndModify:false})
                    .exec()
                    .then((game)=>{
                      Poll.findOneAndUpdate({_id:game.poll},{over:true},{useFindAndModify:false})
                        .exec()
                        .then((poll)=>{
                          io.to(game.mainroom).emit('message',formatMessage('Admin' , 'White Detective Sleep','admin'));
                          var player = game.players.id(game.white);
                          io.to(player.socketid).emit('night');              
                          var max = -1;
                          var flag = false;
                          var id;
                          for(i=0;i<poll.nominated.length;i++){
                            if(poll.nominated[i].count>max){
                              max = poll.nominated[i].count;
                              flag = false
                              id = poll.nominated[i].pid
                            }else if(poll.nominated[i].count===max){
                              flag = true
                            }
                          }
                          if(!flag && max>0){
                            if(game.mafia.includes(id)) io.to(player.socketid).emit('message',formatMessage('Admin' , 'YES!!','admin'));
                            else io.to(player.socketid).emit('message',formatMessage('Admin' , 'NOO!!','admin'));
                            funblack(socket,io,game)
                          }else{
                            funblack(socket,io,game)
                          }                                             
                        })
                    })                                                  
                }                                                          
              }, 1000);
            })
     })
  }else{
    io.to(game.mainroom).emit('message',formatMessage('Admin' , 'You have 10 seconds','admin'));
    sec = time10;
    const timer = setInterval(() => {
      io.to(game.mainroom).emit('timer',sec--);
      if(sec === -1){
        Game.findOneAndUpdate({_id:room},{stage:3},{useFindAndModify:false})
          .exec()
          .then(()=>{
            io.to(game.mainroom).emit('message',formatMessage('Admin' , 'White Detective Sleep!','admin'));
            funblack(socket,io,game)
          })

      }
    }, 1000);

  }

}



const funblack = (socket,io,game)=>{
  const username = socket.request.user.username;
  const room = socket.request.user.game;
  const playerid = socket.request.user._id;
  io.to(game.mainroom).emit('message',formatMessage('Admin' , 'Black Detective Wake Up','admin'));
  if(game.black){
    var black = game.players.id(game.black);
    io.to(black.socketid).emit('wake');
    io.to(game.mainroom).emit('message',formatMessage('Admin' , 'You have 10 seconds','admin'));
    var i;
    var usernames = [];
    var pollarr = [];
    for(i=0;i<game.gameplayers.length;i++){
      var player = game.players.id(game.gameplayers[i]);
      // console.log(player)
      var a = {
        id:game.gameplayers[i],
        username:player.playername
      }
      pollarr.push({pid:game.gameplayers[i],count:0})
      usernames.push(a);
    }
    var poll = new Poll;
    poll.game = room;
    poll.nominated = pollarr;
  
    poll.save()
     .then((poll)=>{
        // console.log(usernames);
        Game.findOneAndUpdate({_id:room},
          {poll:poll._id},{useFindAndModify:false})
            .exec()
            .then((game)=>{
              var i;
              var player = game.players.id(game.black);
              // console.log(poll.nominated)
              io.to(player.socketid).emit('message',formatPoll('Admin' , 'Who To Shoot!','poll',usernames,poll.nominated,poll._id));                                                  
              sec = time10;
              const timer = setInterval(() => {
                io.to(game.mainroom).emit('timer',sec--);
                // console.log('timer')
                if(sec===-1){
                  clearInterval(timer);
                  // console.log('timerover')
                  var i;
                  var player = game.players.id(game.black);
                  io.to(player.socketid).emit('polltime',poll._id);
                  Game.findOneAndUpdate({_id:room},{stage:4},{useFindAndModify:false})
                    .exec()
                    .then((game)=>{
                      Poll.findOneAndUpdate({_id:game.poll},{over:true},{useFindAndModify:false})
                        .exec()
                        .then((poll)=>{
                          io.to(game.mainroom).emit('message',formatMessage('Admin' , 'Black Detective Sleep','admin'));
                          var player = game.players.id(game.black);
                          io.to(player.socketid).emit('night');              
                          var max = -1;
                          var flag = false;
                          var id;
                          for(i=0;i<poll.nominated.length;i++){
                            if(poll.nominated[i].count>max){
                              max = poll.nominated[i].count;
                              flag = false
                              id = poll.nominated[i].pid
                            }else if(poll.nominated[i].count===max){
                              flag = true
                            }
                          }
                          if(!flag && max>0){
                            Game.findOneAndUpdate({_id:room},{blackchoose:id},{useFindAndModify:false})
                              .exec()
                              .then((game)=>{
                                funhealer(socket,io,game)
                              })
                          }else{
                            funhealer(socket,io,game)
                          }                                             
                        })
                    })                                                  
                }                                                          
              }, 1000);
            })
     })
  }else{
    io.to(game.mainroom).emit('message',formatMessage('Admin' , 'You have 10 seconds','admin'));
    sec = time10;
    const timer = setInterval(() => {
      io.to(game.mainroom).emit('timer',sec--);
      if(sec === -1){
        Game.findOneAndUpdate({_id:room},{stage:4},{useFindAndModify:false})
          .exec()
          .then(()=>{
            io.to(game.mainroom).emit('message',formatMessage('Admin' , 'Black Detective Sleep!','admin'));
            funhealer(socket,io,game)
          })

      }
    }, 1000);

  }

}



const funhealer = (socket,io,game)=>{
  const username = socket.request.user.username;
  const room = socket.request.user.game;
  const playerid = socket.request.user._id;
  io.to(game.mainroom).emit('message',formatMessage('Admin' , 'Healer Wake Up','admin'));
  if(game.healer){
    var healer = game.players.id(game.healer);
    io.to(healer.socketid).emit('wake');
    io.to(game.mainroom).emit('message',formatMessage('Admin' , 'You have 10 seconds','admin'));
    var i;
    var usernames = [];
    var pollarr = [];
    for(i=0;i<game.gameplayers.length;i++){
      var player = game.players.id(game.gameplayers[i]);
      // console.log(player)
      var a = {
        id:game.gameplayers[i],
        username:player.playername
      }
      pollarr.push({pid:game.gameplayers[i],count:0})
      usernames.push(a);
    }
    var poll = new Poll;
    poll.game = room;
    poll.nominated = pollarr;
  
    poll.save()
     .then((poll)=>{
        // console.log(usernames);
        Game.findOneAndUpdate({_id:room},
          {poll:poll._id},{useFindAndModify:false})
            .exec()
            .then((game)=>{
              var i;
              var player = game.players.id(game.healer);
              // console.log(poll.nominated)
              io.to(player.socketid).emit('message',formatPoll('Admin' , 'Who To Heal!','poll',usernames,poll.nominated,poll._id));                                                  
              sec = time10;
              const timer = setInterval(() => {
                io.to(game.mainroom).emit('timer',sec--);
                // console.log('timer')
                if(sec===-1){
                  clearInterval(timer);
                  // console.log('timerover')
                  var i;
                  var player = game.players.id(game.healer);
                  io.to(player.socketid).emit('polltime',poll._id);
                  Game.findOneAndUpdate({_id:room},{stage:5},{useFindAndModify:false})
                    .exec()
                    .then((game)=>{
                      Poll.findOneAndUpdate({_id:game.poll},{over:true},{useFindAndModify:false})
                        .exec()
                        .then((poll)=>{
                          io.to(game.mainroom).emit('message',formatMessage('Admin' , 'Healer Sleep','admin'));
                          var player = game.players.id(game.healer);
                          io.to(player.socketid).emit('night');              
                          var max = -1;
                          var flag = false;
                          var id;
                          for(i=0;i<poll.nominated.length;i++){
                            if(poll.nominated[i].count>max){
                              max = poll.nominated[i].count;
                              flag = false
                              id = poll.nominated[i].pid
                            }else if(poll.nominated[i].count===max){
                              flag = true
                            }
                          }
                          if(!flag && max>0){
                            Game.findOneAndUpdate({_id:room},{healerchoose:id},{useFindAndModify:false})
                              .exec()
                              .then((game)=>{
                                nightprocess(socket,io)
                              })
                          }else{
                            nightprocess(socket,io)
                          }                                             
                        })
                    })                                                  
                }                                                          
              }, 1000);
            })
     })
  }else{
    io.to(game.mainroom).emit('message',formatMessage('Admin' , 'You have 10 seconds','admin'));
    sec = time10;
    const timer = setInterval(() => {
      io.to(game.mainroom).emit('timer',sec--);
      if(sec === -1){
        Game.findOneAndUpdate({_id:room},{stage:5},{useFindAndModify:false})
          .exec()
          .then(()=>{
            io.to(game.mainroom).emit('message',formatMessage('Admin' , 'Healer Sleep!','admin'));
            nightprocess(socket,io)
          })

      }
    }, 1000);

  }

}


const nightprocess = (socket,io)=>{
  const username = socket.request.user.username;
  const room = socket.request.user.game;
  const playerid = socket.request.user._id;
  
  Game.findById(room)
    .exec()
    .then((game)=>{
      // console.log(game.mafiachoose)
      io.to(game.mainroom).emit('message',formatMessage('Admin' ,`City Wakeup`,'admin'));            
      wtf(socket,io,game)
        .then(()=>{
  // console.log('checkingreally')
          if(game.blackchoose !== game.healerchoose){
            console.log('Black kills')
            if(game.blackchoose !== null && game.blackchoose !== game.mafiachoose){
              if(game.mafiaTeam.includes(game.blackchoose)){
                killppl(socket,io,game.blackchoose)
                  .then(()=>{
                    console.log('hehe')
                    checkresult(socket,io)
                  })
              }else checkresult(socket,io)
            }else checkresult(socket,io)
          }else checkresult(socket,io)
        })
    })
}

const wtf = (socket,io,game)=>{
  return new Promise((resolve,reject)=>{
    if(game.mafiachoose !== game.healerchoose){
      console.log('Mafia kills')
      if(game.mafiachoose !== null){
        killppl(socket,io,game.mafiachoose)
          .then(()=>{
            resolve()
          })
      }else resolve()
    }else resolve()
  })
}

const funcity = (socket,io)=>{
  const username = socket.request.user.username;
  const room = socket.request.user.game;
  const playerid = socket.request.user._id;
  Game.findById(room)
    .exec()
    .then((game)=>{
        io.to(game.mainroom).emit('message',formatMessage('Admin' , 'Time Over!! Now vote for suspects','admin'));
        // var healer = game.players.id(game.healer);
        // io.to(healer.socketid).emit('wake');
        var i;
        var usernames = [];
        var pollarr = [];
        for(i=0;i<game.gameplayers.length;i++){
          var player = game.players.id(game.gameplayers[i]);
          io.to(player.socketid).emit('pollnight')
          // console.log(player)
          var a = {
            id:game.gameplayers[i],
            username:player.playername
          }
          pollarr.push({pid:game.gameplayers[i],count:0})
          usernames.push(a);
        }
        var poll = new Poll;
        poll.game = room;
        poll.nominated = pollarr;
      
        poll.save()
        .then((poll)=>{
            // console.log(usernames);
            Game.findOneAndUpdate({_id:room},
              {poll:poll._id},{useFindAndModify:false})
                .exec()
                .then((game)=>{
                  var i;
                  for(i=0;i<game.gameplayers;i++){
                    var player = game.players.id(game.gameplayers[i]);
                    io.to(player.socketid).emit('message',formatPoll('Admin' , 'Who To Shoot!','poll',usernames,poll.nominated,poll._id));
                  }                                                  
                  sec = time10;
                  const timer = setInterval(() => {
                    io.to(game.mainroom).emit('timer',sec--);
                    // console.log('timer')
                    if(sec===-1){
                      clearInterval(timer);
                      // console.log('timerover')
                      Game.findById(room)
                        .exec()
                        .then((game)=>{
                          var i;
                          for(i=0;game.gameplayers;i++){
                            var player = game.players.id(game.gameplayers[i]);
                            io.to(player.socketid).emit('polltime',poll._id);                            
                          }
                          Game.findOneAndUpdate({_id:room},{stage:0},{useFindAndModify:false})
                            .exec()
                            .then((game)=>{
                              Poll.findOneAndUpdate({_id:game.poll},{over:true},{useFindAndModify:false})
                                .exec()
                                .then((poll)=>{
                                  io.to(game.mainroom).emit('message',formatMessage('Admin' , 'Time Over!!!','admin'));
                                  // var player = game.players.id(game.healer);
                                  // io.to(player.socketid).emit('night');              
                                  var max = -1;
                                  var flag = false;
                                  var id;
                                  for(i=0;i<poll.nominated.length;i++){
                                    if(poll.nominated[i].count>max){
                                      max = poll.nominated[i].count;
                                      flag = false
                                      id = poll.nominated[i].pid
                                    }else if(poll.nominated[i].count===max){
                                      flag = true
                                    }
                                  }
                                  if(!flag && max>0){
                                    Game.findOneAndUpdate({_id:room},{citychoose:id},{useFindAndModify:false})
                                      .exec()
                                      .then((game)=>{
                                        dayprocess(socket,io)
                                      })
                                  }else{
                                    dayprocess(socket,io)
                                  }                                             
                                })
                            })
                        })

                                                  
                    }                                                          
                  }, 1000);
                })
        })
    })

}

const dayprocess = (socket,io)=>{
  const username = socket.request.user.username;
  const room = socket.request.user.game;
  const playerid = socket.request.user._id;
  
  Game.findById(room)
    .exec()
    .then((game)=>{
      if(game.citychoose !== null){
        killppl(socket,io,game.citychoose)
          .then(()=>{
            // console.log('hehe')
            checkresult(socket,io);
          })
      }
    })
}


const checkresult = (socket,io)=>{
  const username = socket.request.user.username;
  const room = socket.request.user.game;
  const playerid = socket.request.user._id;
  console.log('checking')
  Game.findById(room)
    .exec()
    .then((game)=>{
      if(game.mafiaTeam.length>=game.cityTeam.length){
        io.to(game.mainroom).emit('message',formatMessage('Admin' ,`Mafia Team Wins!!!`,'admin'));
        gameover(socket,io);
      }else if(game.mafiaTeam.length===0){
        io.to(game.mainroom).emit('message',formatMessage('Admin' ,`City Team Wins!!!`,'admin'));
        gameover(socket,io);
      }else{
        if(game.stage === 0){
          round(socket,io,game)
        }else if(game.stage === 5){
          // console.log('hereshould')
          dayround(socket,io)
        }
      }
    })
}

const gameover = (socket,io)=>{
  const username = socket.request.user.username;
  const room = socket.request.user.game;
  const playerid = socket.request.user._id;
  Game.findById(room)
    .exec()
    .then((game)=>{
      game.mafia = [];
      game.mafiaTeam = [];
      game.godFather = null;
      game.cityTeam = [];
      game.citizens = [];
      game.gameplayers = [];
      game.white = null;
      game.black = null;
      game.healer = null;
      game.poll = null;
      game.healerchoose = null;
      game.blackchoose = null;
      game.citychoose = null;
      game.mafiachoose = null;
      game.stage = 0;
      game.active = false;
      game.save()
        .then((game)=>{
          io.to(game.mainroom).emit('wake');
          io.to(game.mainroom).emit('rebut');
        })
    })
}





const killppl = (socket,io,id)=>{
  return new Promise((resolve,reject)=>{
    const username = socket.request.user.username;
    const room = socket.request.user.game;
    const playerid = socket.request.user._id;
    
    Game.findById(room)
      .exec()
      .then((game)=>{
        if(game.gameplayers.includes(id)) game.gameplayers.remove(id);
        if(game.mafiaTeam.includes(id)) game.mafiaTeam.remove(id);
        if(game.mafia.includes(id)) game.mafia.remove(id);
        if(game.cityTeam.includes(id)) game.cityTeam.remove(id);
        if(game.citizens.includes(id)) game.citizens.remove(id);
        if(game.white) if(game.white.equals(id)) game.white = null;
        if(game.black) if(game.black.equals(id)) game.black = null;
        if(game.healer) if(game.healer.equals(id)) game.healer = null;
        if(game.godfather) if(game.godfather.equals(id)) game.godfather = null;
  
        game.save()
          .then(()=>{
            var player = game.players.id(id);
            io.to(game.mainroom).emit('message',formatMessage('Admin' ,`${player.playername} was killed During Night`,'admin'));  
            io.to(player.socketid).emit('kill');            
            resolve();
          })
  
  
      })
  })  
}

const round = (socket,io,game)=>{
  const username = socket.request.user.username;
  const room = socket.request.user.game;
  const playerid = socket.request.user._id;
  io.to(game.mainroom).emit('message',formatMessage('Admin' , 'City Sleeps','admin'));
  Game.findOneAndUpdate({_id:room},
  {stage:1,blackchoose:null,healerchoose:null,mafiachoose:null,citychoose:null},{useFindAndModify:false})
    .exec()
    .then((game)=>{
      var i;
      for(i=0;i<game.gameplayers.length;i++){
        var player = game.players.id(game.gameplayers[i]);
        io.to(player.socketid).emit('night');              
      }
      io.to(game.mainroom).emit('message',formatMessage('Admin' , 'Mafia Team wake Up','admin'));
      for(i=0;i<game.mafiaTeam.length;i++){
        var player = game.players.id(game.mafiaTeam[i]);
        io.to(player.socketid).emit('wake');              
      }
      io.to(game.mainroom).emit('message',formatMessage('Admin' , 'You Have 10 Seconds to Discuss','admin'));
      sec = time10;
      const z = setInterval(() => {
        io.to(game.mainroom).emit('timer',sec--);
        if(sec === -1){
          clearInterval(z);
          io.to(game.mainroom).emit('message',formatMessage('Admin' , 'Time Over! Now vote in 10 seconds','admin'));
          Game.findOne({_id:room,'players.playerid':playerid})
            .exec()
            .then((game)=>{
              if(game){
                var i;
                var usernames = [];
                var pollarr = [];
                for(i=0;i<game.gameplayers.length;i++){
                  var player = game.players.id(game.gameplayers[i]);
                  // console.log(player)
                  var a = {
                    id:game.gameplayers[i],
                    username:player.playername
                  }
                  pollarr.push({pid:game.gameplayers[i],count:0})
                  usernames.push(a);
                }
               var poll = new Poll;
               poll.game = room;
               poll.nominated = pollarr;
  
               poll.save()
                .then((poll)=>{
                // console.log(usernames);
                Game.findOneAndUpdate({_id:room},
                  {poll:poll._id},{useFindAndModify:false})
                    .exec()
                    .then((game)=>{
                      var i;
                      // console.log(game.poll);
                      for(i=0;i<game.mafiaTeam.length;i++){
                        var player = game.players.id(game.mafiaTeam[i]);
                        // console.log(poll.nominated)
                        io.to(player.socketid).emit('message',formatPoll('Admin' , 'Who To Kill!','poll',usernames,poll.nominated,poll._id));                                                  
                      }
                      sec = time10;
                      const timer = setInterval(() => {
                        io.to(game.mainroom).emit('timer',sec--);
                        // console.log('timer')
                        if(sec===-1){
                          clearInterval(timer);
                          // console.log('timerover')
                          var i;
                          for(i=0;i<game.mafiaTeam.length;i++){
                            var player = game.players.id(game.mafiaTeam[i]);
                            // console.log('pollcheck')
                            io.to(player.socketid).emit('polltime',poll._id);
                          }
                            Game.findOneAndUpdate({_id:room},{stage:2},{useFindAndModify:false})
                              .exec()
                              .then((game)=>{
                                    Poll.findOneAndUpdate({_id:game.poll},{over:true},{useFindAndModify:false})
                                      .exec()
                                      .then((poll)=>{
                                            // console.log(poll)
                                            io.to(game.mainroom).emit('message',formatMessage('Admin' , 'Mafia Team Sleep','admin'));
                                            for(i=0;i<game.mafiaTeam.length;i++){
                                              var player = game.players.id(game.mafiaTeam[i]);
                                              io.to(player.socketid).emit('night');              
                                            }
                                            var max = -1;
                                            var flag = false;
                                            var id;
                                            for(i=0;i<poll.nominated.length;i++){
                                              if(poll.nominated[i].count>max){
                                                max = poll.nominated[i].count;
                                                flag = false
                                                id = poll.nominated[i].pid
                                              }else if(poll.nominated[i].count===max){
                                                flag = true
                                              }
                                            }
                                            if(!flag && max>0){
                                              Game.findOneAndUpdate({_id:room},{mafiachoose:id},{useFindAndModify:false})
                                              .exec()
                                              .then((game)=>{
                                                funwhite(socket,io,game)
                                              })
                                            }else{
                                              funwhite(socket,io,game)
                                            }
                                            
  
                                                                                            
                                      })
                              })                                                  
                          // }                                                          
                        }
                      }, 1000);
                    })
  
              })
  
  
  
              }
  
            })
          
        }
        
      }, 1000);                                      
    })
}


const dayround = (socket,io)=>{
  const username = socket.request.user.username;
  const room = socket.request.user.game;
  const playerid = socket.request.user._id;

  // console.log('aareally')

  Game.findById(room)
    .exec()
    .then((game)=>{
      var i;
      for(i=0;i<game.gameplayers.length;i++){
        // console.log('aaa')
        var player = game.players.id(game.gameplayers[i]);
        io.to(player.socketid).emit('night');
        io.to(game.mainroom).emit('message',formatMessage('Admin' ,`You Have 60 seconds to discuss`,'admin'));
        var sec = time60;
        const timer = setInterval(() => {
          io.to(game.mainroom).emit('timer',sec--);
          if(sec === -1){
            clearInterval(timer);
            io.to(game.mainroom).emit('message',formatMessage('Admin' ,`You Have 60 seconds to discuss`,'admin'));
            funcity(socket,io);  
          }
        }, 1000);            
      }
    })

}

module.exports = function(io) {
  io.on('connection',(socket)=>{
      // console.log(socket.request.user);
      socket.on('joinRoom', ()=>{
          const username = socket.request.user.username;
          const room = socket.request.user.game;
          const playerid = socket.request.user._id;
              Game.findOneAndUpdate({'players.playerid':playerid},
              {'players.$.active':true,'players.$.socketid':socket.id},{useFindAndModify:false},(err,doc)=>{
                  Game.findById(room)
                  .select('mainroom players.playername players.active')
                  .exec()
                  .then((game)=>{
                    // console.log(game.mainroom);
                    socket.join(game.mainroom);
                    socket.emit('message',formatMessage('Admin' , 'Welcome','admin'));
                    // console.log(game.mainroom)
                    socket.broadcast.to(game.mainroom).emit('message',formatMessage('Admin' , `${username} has joined`,'admin'));
                    io.to(game.mainroom).emit('usernames',game.players);
                    if(!game.active) socket.emit('rebut')
                  })
              
            })
      });

      socket.on('message',({msg})=>{
        //   console.log(socket.id)
        const username = socket.request.user.username;
        const room = socket.request.user.game;
        const playerid = socket.request.user._id;
        Game.find({_id:room,'players.playerid':playerid})
          .exec()
          .then((game)=>{
            if(game.length){
              // console.log(game[0].mainroom)
              if(game[0].stage === 0 || game[0].stage === 5) io.to(game[0].mainroom).emit('message',formatMessage(username ,msg,socket.id));
              else if(game[0].stage === 1){
                var i;
                for(i=0;i<game[0].mafiaTeam.length;i++){
                  var player = game[0].players.id(game[0].mafiaTeam[i]);
                  io.to(player.socketid).emit('message',formatMessage(username ,msg,socket.id));
                }
              }
            }
          })
      })

      socket.on('disconnect',()=>{
        console.log('Disconnected');
        const username = socket.request.user.username;
        const room = socket.request.user.game;
        const playerid = socket.request.user._id;
        Game.findOneAndUpdate({'players.socketid':socket.id},
        {'players.$.active':false,'players.$.socketid':undefined},{useFindAndModify:false},(err,doc)=>{
                Game.findById(room)
                  .select('mainroom players.playername players.active')
                  .exec()
                  .then((game)=>{
                    // console.log(game.mainroom);
                    socket.leave(game.mainroom);
                    // socket.emit('message',formatMessage('Admin' , 'Welcome','admin'));
                    // console.log(game.mainroom)
                    socket.broadcast.to(game.mainroom).emit('message',formatMessage('Admin' , `${username} has disconnected`,'admin'));
                    io.to(game.mainroom).emit('usernames',game.players);
                  })
              })
          })




      socket.on('startGame',() => {
        const username = socket.request.user.username;
        const room = socket.request.user.game;
        const playerid = socket.request.user._id;
        Game.findOne({_id:room,'players.playerid':playerid})
        .exec()
        .then((game)=>{
          if(game){
            // console.log(game[0].mainroom)
            io.to(game.mainroom).emit('message',formatMessage('Admin' , `${username} requested to start new game`,'admin'));
            if(!game.active){
              if(game.players.length>=1){
                  console.log('Game Can Be Started');
                  io.to(game.mainroom).emit('rembut');
                  io.to(game.mainroom).emit('message',formatMessage('Admin' , 'Game will start in 10 seconds','admin'));
                  // io.to(game[0].mainroom).emit('timertwo',10);
                  game.active = true;
                  var i;
                  for(i=0;i<game.players.length;i++){
                    game.gameplayers.push(game.players[i]._id);
                    // if(i===(game.players.length-1))
                  }
                  var sec = time10;
                  const x = setInterval(() => {
                      io.to(game.mainroom).emit('timer',sec--);
                      if(sec === -1){
                        clearInterval(x);
                        // roles(game.gameplayers);
                        const {mafiaTeam,cityTeam,godFather,mafia,white,black,healer,citizen} = roles(game.gameplayers);
                        // console.log(mafiaTeam);
                        // console.log(white);

                        game.mafiaTeam = mafiaTeam;
                        game.cityTeam = cityTeam;
                        game.mafia = mafia;
                        game.godfather = godFather;
                        game.white = white;
                        game.black = black;
                        game.healer = healer;
                        game.citizens = citizen;
                        game.save()
                        .then(()=>{
                          // console.log('aa')
                          Game.findOne({_id:room,'players.playerid':playerid})
                            .exec()
                            .then((game)=>{
                              if(game){
                                var i;
                                for(i=0;i<mafia.length;i++){
                                  var player = game.players.id(mafia[i]);
                                  io.to(player.socketid).emit('message',formatMessage('Admin' , `You are Mafia`,'admin'));
                                }
                                for(i=0;i<citizen.length;i++){
                                  var player = game.players.id(citizen[i]);
                                  io.to(player.socketid).emit('message',formatMessage('Admin' , `You are Citizen`,'admin'));
                                }
                                var player = game.players.id(godFather);
                                io.to(player.socketid).emit('message',formatMessage('Admin' , `You are GodFather`,'admin'));
                                player = game.players.id(white);
                                io.to(player.socketid).emit('message',formatMessage('Admin' , `You are White Detective`,'admin'));
                                player = game.players.id(black);
                                io.to(player.socketid).emit('message',formatMessage('Admin' , `You are Black Detective`,'admin'));
                                player = game.players.id(healer);
                                io.to(player.socketid).emit('message',formatMessage('Admin' , `You are Healer`,'admin'));
                                io.to(game.mainroom).emit('message',formatMessage('Admin' , 'Night will start in 10 seconds','admin'));
                                var sec = time10;
                                const y = setInterval(() => {
                                  io.to(game.mainroom).emit('timer',sec--);
                                  if(sec === -1){
                                    clearInterval(y);
                                    round(socket,io,game)
                                  }
                                }, 1000);
                              }
                            })                          
                        })
                      } 
                  }, 1000);


              }else{
                  console.log('Game Can Not Be Started');
                  io.to(game.mainroom).emit('rebut');
                  io.to(game.mainroom).emit('message',formatMessage('Admin' , 'Minimum 6 Players required','admin'));
              }
            }else{
                console.log('Game Can Not Be Started');
                io.to(game.mainroom).emit('rebut');
                io.to(game.mainroom).emit('message',formatMessage('Admin' , 'Already Started','admin'));
            }
          }
        })

        

    });

    socket.on('leaveGame',()=>{
      const username = socket.request.user.username;
      const room = socket.request.user.game;
      const playerid = socket.request.user._id;
      // console.log('here')
      Game.findById(room)
        .exec()
        .then((game)=>{
          if(!game.active){
            // socket.leave(game.mainroom);
            var i;
            for(i=0;i<game.players.length;i++){
              // console.log(game.players[i].playerid)
              if(game.players[i].playerid.equals(playerid)){
                var id = game.players[i]._id;
                game.players.remove(id);
                game.save()
                  .then(
                    User.findById(playerid)
                      .exec()
                      .then((user)=>{
                        // console.log('aa')
                        user.valid = true;
                        user.game = null;
                        user.save()
                          .then(()=>{
                            console.log('redirect')
                            socket.emit('redirect')
                          })
                      })
                  )
              }
            }
          }
        })
    })


    socket.on('vote',({id,pid,ppid})=>{
      const username = socket.request.user.username;
      const room = socket.request.user.game;
      const playerid = socket.request.user._id;
      // console.log(id);
      // console.log(pid);
      Poll.findOne({game:room,_id:pid})
        .exec()
        .then((poll)=>{
          // console.log(poll)
          if(!poll.over){
            if(!(poll.voted).includes(playerid)){
              poll.voted.push(playerid);
              var nom = poll.nominated.id(id);
              ++nom.count;
              poll.save()
                .then(()=>{
                  Game.findById(room)
                    .exec()
                    .then((game)=>{
                      if(game.stage===1){
                        game.mafiaTeam.map((mf)=>{
                          var player = game.players.id(mf);
                          var player2 = game.players.id(ppid);
                          io.to(player.socketid).emit('message',formatMessage('Admin' , `${username} voted for ${player2.playername}`,'admin'));
                        })
                      }else if(game.stage === 2){
                        var player = game.players.id(game.white);
                        var player2 = game.players.id(ppid);
                        io.to(player.socketid).emit('message',formatMessage('Admin' , `${username} voted for ${player2.playername}`,'admin'));
                      }else if(game.stage === 3){
                        var player = game.players.id(game.black);
                        var player2 = game.players.id(ppid);
                        io.to(player.socketid).emit('message',formatMessage('Admin' , `${username} voted for ${player2.playername}`,'admin'));
                      }else if(game.stage === 4){
                        var player = game.players.id(game.healer);
                        var player2 = game.players.id(ppid);
                        io.to(player.socketid).emit('message',formatMessage('Admin' , `${username} voted for ${player2.playername}`,'admin'));
                      }else if(game.stage === 5){
                        // var player = game.players.id(game.healer);
                        var player2 = game.players.id(ppid);
                        io.to(game.mainroom).emit('message',formatMessage('Admin' , `${username} voted for ${player2.playername}`,'admin'));
                      }
                    })
            })
            }
          }
        })      
    })


  });
}