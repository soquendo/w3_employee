require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('passport');
require('./config/passport')(passport);
const employeeRoutes = require('./routes/employeeRoutes');
const authRoutes = require('./routes/auth');
const Employee = require('./models/Employee');
const flash = require('express-flash');
const app = express();

// session middleware
app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false
}));

// passport and flash middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// set user globally for all views
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// static files and middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// handlebars setup
const hbs = exphbs.create({
    extname: 'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: {
        eq: (a, b) => a === b,
        formatDate: (date) => new Date(date).toISOString().split('T')[0]
    }
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

// routes
app.use('/auth', authRoutes);
app.use('/employees', employeeRoutes);

// authentication middleware for protected routes
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/auth/login');
}

// dashboard route (protected)
app.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.user });
});

// homepage with employees
app.get('/', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.render('index', { employees });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// db connection
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('MongoDB Connected ✅');
        const PORT = process.env.PORT || 5050;
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('MongoDB Connection Error ❌:', err);
        process.exit(1);
    });