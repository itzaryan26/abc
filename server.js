const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');

const app = express();

// Database connection
mongoose.connect('mongodb://localhost:27017/jobify', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(session({
  secret: 'jobify-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

// Routes
app.use('/', require('./routes/auth'));
app.use('/jobs', require('./routes/jobs'));
app.use('/applications', require('./routes/applications'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { error: err });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});