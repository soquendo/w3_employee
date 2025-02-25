const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// middleware to ensure authentication
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect('/auth/login');
};

// format date MM/DD/YYYY
const formatDate = (date) => {
    const d = new Date(date);
    const month = (`0${d.getMonth() + 1}`).slice(-2);
    const day = (`0${d.getDate()}`).slice(-2);
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
};

// homepage employee list
router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find();
        const formattedEmployees = employees.map(emp => ({
            ...emp._doc,
            startDate: formatDate(emp.startDate)
        }));
        res.render('index', { employees: formattedEmployees, user: req.user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// new employee form
router.get('/new', ensureAuthenticated, (req, res) => res.render('new'));

// create employee
router.post('/', ensureAuthenticated, async (req, res) => {
    try {
        await Employee.create(req.body);
        res.redirect('/employees');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// edit employee form
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).send('Employee not found');
        res.render('edit', { employee });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// update employee
router.put('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!employee) return res.status(404).send('Employee not found');
        res.redirect('/employees');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// delete employee
router.delete('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).send('Employee not found');
        res.redirect('/employees');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// delete conf page
router.get('/delete/:id', ensureAuthenticated, async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        res.render('delete', { employee });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;