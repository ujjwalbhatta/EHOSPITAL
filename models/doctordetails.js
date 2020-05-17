const mongoose = require('mongoose');

const DoctorDetailsSchema = new mongoose.Schema({
    days:{
        type: String
    },
    time:{
        type: String
    },
    shift:{
        type: String
    },
    doctorid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'doctor'
  },
});

const DoctorDetails = mongoose.model('DoctorDetails',DoctorDetailsSchema);

module.exports =  DoctorDetails;