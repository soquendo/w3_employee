const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// register form
router.get('/register', (req, res) => {
    res.render('auth/register');
});

// user reg
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.render('auth/register', { error: 'All fields are required' });
    }

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.render('auth/register', { error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ username, email, password: hashedPassword });

        await user.save();
        res.redirect('/auth/login');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// render login
router.get('/login', (req, res) => {
    res.render('auth/login');
});

// handle login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);
});

// logout
router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/auth/login');
    });
});

module.exports = router;