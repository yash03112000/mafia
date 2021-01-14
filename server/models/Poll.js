const mongoose = require('mongoose');





const NominneeSchema = new mongoose.Schema({
  
    pid:{
      type:mongoose.Schema.Types.ObjectId
    },
    count:{
      type:Number,
      default:0
    }
  
});

const PollSchema = new mongoose.Schema({
  
  game:{
    type:mongoose.Schema.Types.ObjectId
  },
  voted:[mongoose.Schema.Types.ObjectId],
  nominated:[NominneeSchema],
  over:{
    type:Boolean,
    default:false
  }

});





module.exports = mongoose.model('Poll', PollSchema);
