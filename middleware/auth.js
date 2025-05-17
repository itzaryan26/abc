const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  req.flash('error', 'Please log in to access this page');
  res.redirect('/login');
};

const isEmployer = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'employer') {
    return next();
  }
  req.flash('error', 'Access denied. Employers only.');
  res.redirect('/jobs');
};

module.exports = { isAuthenticated, isEmployer };