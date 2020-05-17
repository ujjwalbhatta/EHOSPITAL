const express = require('express');
const router = express.Router();

//call model
const Feedback = require('../models/feedback');

router.get('/sendfeedbacks', (req,res)=>{
    res.render('feedback',{
        user: req.user,
        pageTitle: 'Feedback',
    });
});

router.post('/feedbackform', (req,res) =>{
    const feedback = new Feedback();
    feedback.name = req.body.name;
    feedback.title = req.body.title;
    feedback.message = req.body.message;
    feedback.patientid = req.user._id;
    feedback.save();
    req.flash('success_msg','Feedback Sent. Thanks for the feedback');
    res.redirect('/sendfeedbacks');
});

module.exports = router;