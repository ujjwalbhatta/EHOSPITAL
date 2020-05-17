const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({

    title: {
        type: String,
        required: 'Title is Required'
    },
    imageUrl: {
        type: String
    },
    patientid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
      date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Report',reportSchema)