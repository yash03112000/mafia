const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String
  },
  password: {
    type: String
  },
  valid:{
    type: Boolean,
    default: true
  },
  game:{
    type: mongoose.Schema.Types.ObjectId,
  }
});

module.exports = mongoose.model('User', UserSchema);
