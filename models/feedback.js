const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({

    name: {
        type:String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    patientid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
  },
});

const Feedback = mongoose.model('Feedback',FeedbackSchema);

module.exports =  Feedback;
