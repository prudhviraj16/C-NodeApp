const mongoose = require("mongoose");
const validator = require("validator");

const PostSchema = new mongoose.Schema({

  todo: {
    type: String,
    required: true,
    validate(value) {
      if (value.length < 10) {
        throw new Error("Enter String length of greater than 5");
      }
    },
    trim: true,
    lowercase: true,
  },
  completed : {
    type : Boolean,
    required : false,
    default : false
  },
  owner : {
    type : mongoose.Schema.Types.ObjectId,
    required : true,
    ref : 'User'
  }
}, {
  timestamps : true
})

module.exports = mongoose.model("Post", PostSchema);
