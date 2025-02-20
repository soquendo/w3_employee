const crypto = require('crypto');

const password = 'testpassword'; // The password to hash and compare

// Hash the password
const hash = crypto.createHash('sha256').update(password.trim()).digest('hex');
console.log("🔑 Hashed Password:", hash);

// Compare the hashed password with the original password
const enteredHash = crypto.createHash('sha256').update(password.trim()).digest('hex');
console.log("Entered Hash:", enteredHash);

const isMatch = enteredHash === hash;
console.log("Match Result:", isMatch); // Should be true if the password is correct