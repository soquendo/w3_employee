const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// homepage employee list
router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.render('index', { employees });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// new employee form
router.get('/new', (req, res) => res.render('new'));

// create employee
router.post('/', async (req, res) => {
    try {
        await Employee.create(req.body);
        res.redirect('/employees');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// edit employee form
router.get('/edit/:id', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).send('Employee not found');
        res.redirect('/employees');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// show delete confirmation page
router.get('/delete/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        res.render('delete', { employee });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;