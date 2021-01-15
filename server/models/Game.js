const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
  playerid:{
    type: mongoose.Schema.Types.ObjectId,
  },
  playername:{
    type:String
  },
  active:{
    type:Boolean
  },
  socketid:{
    type:String,
    default:undefined
  }
  
});





const GameSchema = new mongoose.Schema({
  name:{
    type: String,
    default:''
  },
  private:{
    type: Boolean
  },
  players:[UserSchema],
  mainroom:{
    type: String
  },
  active:{
    type:Boolean,
    default:false
  },
  gameplayers:[mongoose.Schema.Types.ObjectId],
  mafiaTeam:[mongoose.Schema.Types.ObjectId],
  cityTeam:[mongoose.Schema.Types.ObjectId],
  mafia:[mongoose.Schema.Types.ObjectId],
  citizens:[mongoose.Schema.Types.ObjectId],
  healer:{
    type:mongoose.Schema.Types.ObjectId
  },
  white:{
    type:mongoose.Schema.Types.ObjectId
  },
  black:{
    type:mongoose.Schema.Types.ObjectId
  },
  godfather:{
    type:mongoose.Schema.Types.ObjectId
  },
  stage:{
    type:Number,
    default:0
  },
  poll:{
    type:mongoose.Schema.Types.ObjectId
  },
  mafiachoose:{
    type:mongoose.Schema.Types.ObjectId,
    default:null
  },
  blackchoose:{
    type:mongoose.Schema.Types.ObjectId,
    default:null
  },
  healerchoose:{
    type:mongoose.Schema.Types.ObjectId,
    default:null
  },
  citychoose:{
    type:mongoose.Schema.Types.ObjectId,
    default:null
  }
});



module.exports = mongoose.model('Game', GameSchema);
