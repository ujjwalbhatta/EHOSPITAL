const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const { ensureAuthenticated1 } = require('../config/auth');

// Welcome Page
router.get('/',(req,res) => res.render('Home'));

//login page patient
router.get('/patient/welcome',(req,res) => res.render('welcome'));

// Welcome Doctor
router.get('/doctor/welcomedr',(req,res) => res.render('welcomedr'));

//Doctordashboard
router.get('/doctordashboard',ensureAuthenticated1,(req,res) => {
res.render('doctordashboard',{
     user: req.user
});
});

//patientdashboard page
router.get('/patientdashboard',ensureAuthenticated,(req,res) =>{ 
res.render('patientdashboard',{
     user: req.user
});
});

module.exports = router;