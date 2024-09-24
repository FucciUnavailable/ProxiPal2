const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the user schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    balance: { type: Number, default: 0 }, // Add balance field
    transactions: { type: Array, default: [] }, // Add transactions field
    createdAt: { type: Date, default: Date.now }
  });
  

  /*

// Hash the password before saving it
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified or is new
  if (this.isModified('password') || this.isNew) {
    const saltRounds = 10; // You can adjust the salt rounds if needed
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});
*/
// Add a method to compare password
userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};



module.exports = mongoose.model('User', userSchema);
