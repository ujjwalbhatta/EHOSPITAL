const express = require('express');
const router = express.Router();
require('dotenv').config();
const cloudinary = require('cloudinary');

//call handlers and models
require('../handlers/cloudinary');
const upload = require('../handlers/multer');
const Report = require('../models/report');
const Patient = require('../models/patient');

router.get('/uploadreport', (req,res) =>{
    res.render('uploadreport',{
        user: req.user
    });
});

router.post('/upload_reports', upload.single('image'), async(req,res) => {
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    const report = new Report();
    report.title = req.body.title;
    report.imageUrl = result.secure_url;
    report.patientid = req.user._id;
    await report.save();
    res.redirect('/seereport');
});

router.get('/seereport', async (req,res) =>{
    const user_id = req.user._id;
    const patient = await Patient.findById(user_id);
    const images = await Report.find({"patientid" : patient._id})
    res.render('seereport',{
        images,
        user: req.user
    });
});

module.exports = router;