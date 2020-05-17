const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const passport = require('passport');

//authenticate
const { ensureAuthenticated1 } = require('../config/auth');

//passportdr config
require('../config/passport');

//call models
const Doctor = require('../models/doctor');
const Patient = require('../models/patient');
const Report = require('../models/report');
const DoctorDetails = require('../models/doctordetails');

//login page
router.get('/Dlogin',(req,res) => res.render('logindr')); 

//register page
router.get('/Dregister',(req,res) => res.render('registerdr')); 

router.post('/Dregister',(req,res)=>{
    const { name, email, password, password2,salutation,phonenumber,experience,speciality,qualification,gender,description } = req.body;
    const {imageUrl='https://res.cloudinary.com/nazus/image/upload/v1587475204/cakut3nckczmbtfnhmsk.png'} = req.body;
    let errors=[];

    //check required fields
    if( !name  || !email || !password || !password2 || !salutation || !phonenumber || !experience || !speciality || !qualification || !gender || !description){
        errors.push({msg: 'Please fill in all required fields'});
    }

    //check password match
    if(password !== password2){
        errors.push({msg: 'Passwords do not match'});
    }

    //check pass length
    if(password.length < 6){
        errors.push({msg: 'Password length should be at least six characters'});
    }

    if(errors.length>0){
        res.render('registerdr',{   //suppose kunai condition meet garena bhane ni tei page ma basne bhayo
            errors,               //register lai rendering garda errors lai pathairacha which is checked in messages 
            name,
            email,
            password,
            password2,
            salutation,
            phonenumber,
            experience,
            speciality,
            qualification,
            gender,
            description  
        });
    }else{
        //validation passed
        Doctor.findOne({ email:email})
            .then(doctor => {
                if(doctor) {
                    // exists
                    errors.push({ msg: 'Email is already registered'});
                    res.render('registerdr',{ //if their is user re render the reg form and send error  
                        errors,                
                        name,
                        email,
                        password,
                        password2,
                        salutation,
                        phonenumber,
                        experience,
                        speciality,
                        qualification,
                        gender,
                        description
                    });
                }else{ //if there is new  user we have to create a user
                    const newUser = new Doctor({
                        name, // name:name,
                        email,
                        password,
                        salutation,
                        phonenumber,
                        experience,
                        speciality,
                        qualification,
                        gender,
                        description,
                        imageUrl
                    });

                   // Hash password
                   bcrypt.genSalt(10, (err, salt) =>
                    bcrypt.hash(newUser.password, salt, (err,hash)=>{
                        if(err) throw err;
                        //set password to hash
                        newUser.password = hash;
                        //save user
                        newUser.save()
                            .then(doctor => {
                                req.flash('success_msg','You are now registered and can log in'); //calling flash msg after success
                                res.redirect('/doctor/Dlogin'); //localhst ma k path handa kata jane 
                            })
                            .catch(err => console.log(err));
                    }))
                }
            });
    }

});

//doctor login handle  
router.post('/Dlogin', 
  passport.authenticate('doctor',
   { successRedirect: '/doctordashboard',
   failureRedirect: '/doctor/Dlogin' ,
   failureFlash: true}));

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
  });

//make appointments
router.get('/makeappointments',ensureAuthenticated1,async(req,res) => {
    res.render('doctorupdate'),{
        user:req.user
    };
});

// appointments handle
router.post('/makeappointments',(req,res)=>{
    const { days, time, shift, doctorid } = req.body;
    let errors=[];

    //check required fields
    if( !days  || !time || !shift ){
        errors.push({msg: 'Please fill in all required fields'});
    }

    if(errors.length>0){
        res.render('doctorupdate',{   
            errors,               
            days,
            time,
            shift,
            doctorid,
        });
    }else{
     
                 const newUser = new DoctorDetails({
                       days,
                       time,
                       shift,
                       doctorid
                    });
                    newUser.doctorid = req.user._id;
                    //console.log(newUser);    
                    newUser.save()
                    req.flash('success_msg','Thanks For The Information We appreciate it'); 
                    res.redirect('/doctor/makeappointments');
            }
});

// View patients
// router.get('/viewpatients',ensureAuthenticated1, async(req, res)=>{
//     const patients = await Patient.find({})
//     res.render('viewpatients',{
//       patients,
//       user:req.user
//     });
// });

// router.get('/viewpatients',ensureAuthenticated1, async(req, res)=>{
//     if(req.query.search) {
//         const regex = new RegExp(escapeRegex(req.query.search),'gi')
//         const patients = await Patient.find({name: regex})
//             if(patients.length<0){
//                 req.flash('error_msg','bhayena yo');
//                 res.redirect('/doctor/viewpatients');
//             }
//             res.render('viewpatients',{
//                 patients,
//                 user:req.user
//             });
//         }
//     else {
//         const patients = await Patient.find({})
//             res.render('viewpatients',{
//                 patients,
//                 user:req.user
//             });
//         }    
// });

router.get('/viewpatients', ensureAuthenticated1, async(req,res) => {

    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        await Patient.find({name:regex},function(err,patients){
            if(err){
                throw err
            }else{
                if(patients.length < 1){
                    req.flash('error_msg','Sorry! Patient not found');
                    res.redirect('/doctor/viewpatients');
                }else{
                    res.render('viewpatients',{
                        patients,
                        user: req.user
                    });
                }
            }
        })
    } else {
        const patients = await Patient.find({})
                    res.render('viewpatients',{
                        patients,
                        user:req.user
                    });
                   
        }       

});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


//view more details of patients
router.param('id', function(req,res,next,_id){
    Patient.findOne({_id},function(err,details){
        if(err) throw err;
        else{
            req.patient = details;
            next();
        }
    });
});

router.param('id',function(req,res,next,patientid){
    Report.find({patientid},function(err,reports){
        if(err) throw err;
        else{
            req.report = reports;
            next();
        }
    });
});

router.get('/:id',async(req,res) =>{
    res.render('patientdetails',{
        patient: req.patient,
        report: req.report,
        user: req.user
    });
});



module.exports = router;


