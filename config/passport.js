const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../models/User');

// hash function
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

module.exports = function (passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            const user = await User.findOne({ email: email.trim() });
            if (!user) return done(null, false, { message: 'No user found with this email' });

            const hashedInput = hashPassword(password.trim());
            if (user.password !== hashedInput) {
                return done(null, false, { message: 'Incorrect password' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }));

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
};