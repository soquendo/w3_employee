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
const flash = require('connect-flash');
const app = express();

// session middleware - before passport
app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use((req, res, next) => {
    res.locals.error = req.flash('error');
    next();
});

app.use(passport.initialize());
app.use(passport.session());

// middleware
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

// authentication routes
app.use('/auth', authRoutes);

// employee routes
app.use('/employees', employeeRoutes);

// authentication middleware for protected routes
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

// protected dashboard route
app.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.send(`Welcome, ${req.user.username}`);
});

// fetch employees for homepage
app.get('/', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.render('index', { employees });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// db connection - server start
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('MongoDB Connected ✅');

        // server starts only after successful db connection
        const PORT = process.env.PORT || 5050;
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('MongoDB Connection Error ❌:', err);
        process.exit(1); // exit process if db connection fails
    });