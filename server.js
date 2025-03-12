require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { engine } = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
require('./config/passport')(passport);
const employeeRoutes = require('./routes/employeeRoutes');
const authRoutes = require('./routes/auth');
const Employee = require('./models/Employee');
const flash = require('express-flash');
const path = require('path');

const app = express();

// session middleware with mongo store
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'simpleTestSecret',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            ttl: 14 * 24 * 60 * 60 // 14 days
        }),
        cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 }
    })
);

// passport and flash middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// global user for all views
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// static files and middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// handlebars setup
app.engine(
    'hbs',
    engine({
        extname: 'hbs',
        handlebars: allowInsecurePrototypeAccess(Handlebars),
        helpers: {
            eq: (a, b) => a === b,
            formatDate: (date) => {
                const d = new Date(date);
                const month = (`0${d.getMonth() + 1}`).slice(-2);
                const day = (`0${d.getDate()}`).slice(-2);
                const year = d.getFullYear();
                return `${month}/${day}/${year}`;
            }
        }
    })
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// routes
app.use('/auth', authRoutes);
app.use('/employees', employeeRoutes);

// auth middleware
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/auth/login');
}

// dashboard
app.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.user });
});

// homepage
app.get('/', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.render('index', { employees });
    } catch (err) {
        console.error(err);
        res.status(500).send('server error');
    }
});

// mongo connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('mongodb connected ✅');
        const PORT = process.env.PORT || 10000;
        app.listen(PORT, () => console.log(`🚀 server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('mongodb connection error ❌:', err);
        process.exit(1);
    });

module.exports = app;