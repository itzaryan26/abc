const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const { isAuthenticated } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/jobs/:jobId/apply', isAuthenticated, upload.single('resume'), async (req, res) => {
  try {
    const application = new Application({
      job: req.params.jobId,
      applicant: req.session.user._id,
      resume: req.file.filename,
      coverLetter: req.body.coverLetter
    });
    await application.save();
    req.flash('success', 'Application submitted successfully');
    res.redirect(`/jobs/${req.params.jobId}`);
  } catch (err) {
    req.flash('error', 'Error submitting application');
    res.redirect(`/jobs/${req.params.jobId}`);
  }
});

router.get('/applications', isAuthenticated, async (req, res) => {
  try {
    let applications;
    if (req.session.user.role === 'employer') {
      applications = await Application.find()
        .populate('job')
        .populate('applicant', 'email')
        .where('job.employer').equals(req.session.user._id);
    } else {
      applications = await Application.find({ applicant: req.session.user._id })
        .populate('job');
    }
    res.render('applications/index', { applications });
  } catch (err) {
    req.flash('error', 'Error loading applications');
    res.redirect('/');
  }
});

module.exports = router;