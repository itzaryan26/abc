const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { isAuthenticated, isEmployer } = require('../middleware/auth');

// Get all jobs with search and filter
router.get('/', async (req, res) => {
  try {
    const { search, type, location } = req.query;
    let query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (type) {
      query.type = type;
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const jobs = await Job.find(query).populate('employer', 'company').sort('-createdAt');
    res.render('jobs/index', { jobs });
  } catch (err) {
    req.flash('error', 'Error loading jobs');
    res.redirect('/');
  }
});

// Create new job
router.get('/new', isAuthenticated, isEmployer, (req, res) => {
  res.render('jobs/new');
});

router.post('/', isAuthenticated, isEmployer, async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      employer: req.session.user._id
    });
    await job.save();
    req.flash('success', 'Job posted successfully');
    res.redirect('/jobs');
  } catch (err) {
    req.flash('error', 'Error creating job');
    res.redirect('/jobs/new');
  }
});

// Show job details
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'company');
    if (!job) {
      req.flash('error', 'Job not found');
      return res.redirect('/jobs');
    }
    res.render('jobs/show', { job });
  } catch (err) {
    req.flash('error', 'Error loading job');
    res.redirect('/jobs');
  }
});

// Edit job
router.get('/:id/edit', isAuthenticated, isEmployer, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job || job.employer.toString() !== req.session.user._id.toString()) {
      req.flash('error', 'Access denied');
      return res.redirect('/jobs');
    }
    res.render('jobs/edit', { job });
  } catch (err) {
    req.flash('error', 'Error loading job');
    res.redirect('/jobs');
  }
});

router.put('/:id', isAuthenticated, isEmployer, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job || job.employer.toString() !== req.session.user._id.toString()) {
      req.flash('error', 'Access denied');
      return res.redirect('/jobs');
    }
    await Job.findByIdAndUpdate(req.params.id, req.body);
    req.flash('success', 'Job updated successfully');
    res.redirect(`/jobs/${req.params.id}`);
  } catch (err) {
    req.flash('error', 'Error updating job');
    res.redirect(`/jobs/${req.params.id}/edit`);
  }
});

// Delete job
router.delete('/:id', isAuthenticated, isEmployer, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job || job.employer.toString() !== req.session.user._id.toString()) {
      req.flash('error', 'Access denied');
      return res.redirect('/jobs');
    }
    await job.remove();
    req.flash('success', 'Job deleted successfully');
    res.redirect('/jobs');
  } catch (err) {
    req.flash('error', 'Error deleting job');
    res.redirect('/jobs');
  }
});

module.exports = router;