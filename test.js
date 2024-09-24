const bcrypt = require('bcrypt');

const password = 'your_test_password';
const hashedPassword = await bcrypt.hash(password, 10);
const isMatch = await bcrypt.compare(password, hashedPassword);

console.log("Hashed Password:", hashedPassword);
console.log("Password Match:", isMatch);
