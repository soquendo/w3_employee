const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const employeeRoutes = require('./routes/employeeRoutes');
const Employee = require('./models/Employee'); // model needed for homepage data

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use('/employees', employeeRoutes);

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
    .connect('mongodb://localhost:27017/Empl', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));