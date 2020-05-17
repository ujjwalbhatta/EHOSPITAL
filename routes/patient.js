const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//authenticate
const { ensureAuthenticated } = require('../config/auth');

//passportdr config
require('../config/passport');

//call models
const Patient = require('../models/patient');
const Doctor = require('../models/doctor'); 
const DoctorDetails = require('../models/doctordetails');

//login page
router.get('/login',(req,res) => res.render('login')); //arrowfunc with req and res object

//reg page
router.get('/register',(req,res) => res.render('register')); 

//router post
router.post('/register',(req,res)=>{

    const {tokennumber, name, email, password, password2, gender, address, age} = req.body
    const {imageUrl='https://res.cloudinary.com/nazus/image/upload/v1587475204/cakut3nckczmbtfnhmsk.png'} = req.body;
    let errors=[];

    //check required fields
    if( !tokennumber || !name  || !email || !password || !password2 || !gender || !address || !age ){
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
        res.render('register',{   //suppose kunai condition meet garena bhane ni tei page ma basne bhayo
            errors,
            tokennumber,                
            name,
            email,
            password,
            password2,
            gender,
            address,
            age
        });
    }else{
        //validation passed
        Patient.findOne({ email:email})
            .then(patient => {
                if(patient) {
                    // exists
                    errors.push({ msg: 'Email is already registered'});
                    res.render('register',{ //if their is user re render the reg form and send error  
                        errors,   
                        tokennumber,             
                        name,
                        email,
                        password,
                        password2,
                        gender,
                        address,
                        age
                    });
                }else{ //if there is new  user we have to create a user
                    const newUser = new Patient({
                        tokennumber,
                        name,
                        email,
                        password,
                        gender,
                        address,
                        age,
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
                            .then(patient => {
                                req.flash('success_msg','You are now registered and can log in'); //calling flash msg after success
                                res.redirect('/patient/login'); //localhst ma k path handa kata jane 
                            })
                            .catch(err => console.log(err));
                    }))
                }
            });
    }

});

//patient login handle
router.post('/login', 
  passport.authenticate('patient', 
  { successRedirect: '/patientdashboard', 
    failureRedirect: '/patient/login',
    failureFlash: true 
  }));
 
// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
  });  

// //View Doctors
// router.get('/viewdoctors',ensureAuthenticated, async(req,res) => {
//     const doctors = await Doctor.find({})
//     res.render('viewdoctors',{
//         doctors,
//         user: req.user
//     });
// });  

//View Doctors
// router.get('/viewdoctors',ensureAuthenticated, async(req,res) => {
//     if(req.query.search) {
//         const regex = new RegExp(escapeRegex(req.query.search), 'gi');
//         const doctors = await Doctor.find({name: regex})
//             res.render('viewdoctors',{
//                 doctors,
//                 user: req.user
//             });
//         }
//     else {
//         const doctors = await Doctor.find({})
//             res.render('viewdoctors',{
//                 doctors,
//                 user: req.user
//             });
//         }
// });  

router.get('/viewdoctors', ensureAuthenticated, async(req,res) => {

    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        await Doctor.find({name:regex},function(err,doctors){
            if(err){
                throw err
            }else{
                if(doctors.length < 1){
                    req.flash('error_msg','Sorry! Doctor not found');
                    res.redirect('/patient/viewdoctors');
                }else{
                    res.render('viewdoctors',{
                        doctors,
                        user: req.user
                    });
                }
            }
        })
    } else {
        const doctors = await Doctor.find({})
                    res.render('viewdoctors',{
                        doctors,
                        user: req.user
                    });
        }       

});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//view more details of doctors
router.param('id',function(req,res,next,_id){
    Doctor.findOne({_id},function(err,details){
        if (err) {
            res.json(err);
        }
        else{
            req.doctor = details;
            next();
        }
    });
});

router.param('id',function(req,res,next,doctorid){
    DoctorDetails.findOne({doctorid},function(err,details){
        if(err) {
            res.json(err);
        }
        else{
            req.detail = details;
            // console.log(req.doctordetails);
            next();
        }
    })
});

router.get('/:id', async(req, res)=>{
	res.render('doctordetails', {
    doctor: req.doctor,
    detail: req.detail,
    user:req.user
    });
});


module.exports = router;