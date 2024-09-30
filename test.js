const bcrypt = require('bcrypt');

async function testHashing() {
  const password = "testingstuff"; // Use a test password
  const saltRounds = 10;

  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log("Hashed password:", hashedPassword);

  const isMatch = await bcrypt.compare(password, hashedPassword);
  console.log("Password match:", isMatch); // Should return true
}

console.log(testHashing());