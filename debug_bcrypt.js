const bcrypt = require('bcryptjs');

const enteredPassword = 'newpass2'; // The password you entered during login
const storedHash = '$2a$10$hADifQmFghIbSICyo3KVucMS2WiM0LAL0qWTialadmcSkb6HOS'; // The hash stored in MongoDB

async function checkPassword() {
    const isMatch = await bcrypt.compare(enteredPassword, storedHash);
    console.log(isMatch ? "✅ Passwords match!" : "❌ Password mismatch!");
}

checkPassword();