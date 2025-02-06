const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function (passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            const user = await User.findOne({ email });

            if (!user) {
                return done(null, false, { message: 'No user found with this email' });
            }

            // force stored password to be string
            const storedHash = user.password.toString();

            // log passwords - debug
            console.log("🔍 Login Attempt:", { email, enteredPassword: password });
            console.log("Stored hash:", storedHash);

            const isMatch = await bcrypt.compare(password.toString(), user.password.toString());

            if (!isMatch) {
                console.log("❌ Password mismatch");
                return done(null, false, { message: 'Incorrect password' });
            }

            console.log("✅ Password match, user logged in:", user.username);
            return done(null, user);
        } catch (err) {
            console.error('Error in Passport authentication:', err);
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