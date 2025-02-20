const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');
const passport = require('passport');
const flash = require('express-flash');

router.use(flash());

// helper to hash passwords
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// register form
router.get('/register', (req, res) => {
    res.render('auth/register', { error: req.flash('error') });
});

// handle registration
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.render('auth/register', { error: 'All fields required' });
    }

    try {
        let user = await User.findOne({ email: email.trim() });
        if (user) return res.render('auth/register', { error: 'Email already exists' });

        user = new User({ username, email, password: hashPassword(password.trim()) });
        await user.save();
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// login form
router.get('/login', (req, res) => {
    res.render('auth/login', { error: req.flash('error') });
});

// handle login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/auth/login',
        failureFlash: true,
    })(req, res, next);
});

// logout
router.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash('success_msg', 'Logged out successfully');
        res.redirect('/auth/login');
    });
});

module.exports = router;