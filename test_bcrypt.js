const bcrypt = require('bcryptjs');

const password = 'newpass'; // same password you used before

async function testHashing() {
    const newHash = await bcrypt.hash(password, 10);
    console.log("New Hash:", newHash);
}

testHashing();