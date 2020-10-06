const {Schema, model} = require('mongoose')

const schema = new Schema({
   name: {
      type:String,
      trim: true
   },
   age: {
      type: Number,

   }
})