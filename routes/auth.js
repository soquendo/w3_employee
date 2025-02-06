const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const flash = require('express-flash');

router.use(flash()); // enable flash messages

// register form
router.get('/register', (req, res) => {
    res.render('auth/register', { error: req.flash('error') });
});

// user registration
// user registration route
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

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({ username, email, password: hashedPassword });

        await user.save();
        console.log(`✅ New user registered: ${username} (${email})`);
        res.redirect('/auth/login');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// login form
router.get('/login', (req, res) => {
    res.render('auth/login', { error: req.flash('error'), success: req.flash('success') });
});

// handle login
router.post('/login', (req, res, next) => {
    console.log('🔍 Login Attempt:', req.body);

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('❌ Login Error:', err);
            return next(err);
        }

        if (!user) {
            req.flash('error', info.message || 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        req.logIn(user, (err) => {
            if (err) {
                console.error('❌ Session Error:', err);
                return next(err);
            }
            console.log(`✅ Login Successful: ${user.username} (${user.email})`);
            return res.redirect('/dashboard');
        });
    })(req, res, next);
});

// logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            console.error('❌ Logout Error:', err);
            return next(err);
        }
        req.flash('success', 'You have been logged out.');
        res.redirect('/auth/login');
    });
});

module.exports = router;