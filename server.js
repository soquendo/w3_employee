const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const employeeRoutes = require('./routes/employeeRoutes');
const Employee = require('./models/Employee');
const session = require('express-session');
const passport = require('passport');
require('./config/passport')(passport);
const authRoutes = require('./routes/auth');


app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false
}));

const app = express();

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use('/employees', employeeRoutes);
app.use('/auth', authRoutes);

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

app.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.send(`Welcome, ${req.user.username}`);
});

// handlebars setup with helpers
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

// database connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));