const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// register user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        let user = await User.findOne({ email });

        if (user) return res.status(400).send('User already exists');

        user = new User({ username, email, password });
        await user.save();
        res.redirect('/login');
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// login user
router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));

// logout user
router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/login');
    });
});

module.exports = router;