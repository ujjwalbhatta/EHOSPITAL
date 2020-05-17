const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const bcrypt = require('bcryptjs');

//call models
const Patient = require('../models/patient');
const Doctor = require('../models/doctor');

passport.use('patient',new LocalStrategy({
    usernameField: 'email'},
    (email,password,done) => {
        //match user
        Patient.findOne({email:email})
        .then(patient => {
            if(!patient){
                return done(null,false,{message:'That email is not registerd'});
            }
            
        //match password
        bcrypt.compare(password,patient.password,(err,isMatch) => {
            if(err) throw err;

            if(isMatch){
                return done(null,patient);
            }
            else{
                return done(null,false,{message:'Password Incorrect'});
            }
            
        });    
        })
        .catch(err => console.log(err));
    })
);

passport.use('doctor',new LocalStrategy({
    usernameField: 'email'},
    (email,password,done) => {
        //match user
        Doctor.findOne({email:email})
        .then(doctor => {
            if(!doctor){
                return done(null,false,{message:'That email is not registerd'});
            }
            
        //match password
        bcrypt.compare(password,doctor.password,(err,isMatch) => {
            if(err) throw err;

            if(isMatch){
                return done(null,doctor);
            }
            else{
                return done(null,false,{message:'Password Incorrect'});
            }
            
        });    
        })
        .catch(err => console.log(err));
    })
);

passport.serializeUser(function(patient,done){
    done(null,patient.id);
})

passport.deserializeUser(function(id,done){
    Doctor.findById(id,function(err, patient){
        if(err) done(err);
            if(patient){
             done(null,patient);
            } else{
                Patient.findById(id, function(err,patient){
                    if(err) done(err);
                    done(null,patient);
                })
            }
    });
});