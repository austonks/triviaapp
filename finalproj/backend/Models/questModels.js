const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  quest: {
    type: String,
    required: true
  },
  options: [{
    id: {
      type: Number,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  }]
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;