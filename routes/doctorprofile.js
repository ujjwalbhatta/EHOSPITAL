const express = require('express');
const router = express.Router();
require('dotenv').config();
const cloudinary = require('cloudinary');

//call models and handlers
require('../handlers/cloudinary');
const upload = require('../handlers/multer');
const Doctor =  require('../models/doctor');

//doctor profile page
router.get('/doctorprofile',async(req,res) =>{
    res.render('doctorprofile',{
    user:req.user
    });
});

// Upload profile photo  
router.post('/change_avatar_doctor', upload.single('image'),async(req,res) => {
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    const profile = await Doctor.findByIdAndUpdate({"_id":req.user._id});
    profile.imageUrl = result.secure_url;
    await profile.save();
    res.redirect('/doctorprofile');
    })

module.exports = router;