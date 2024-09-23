const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')
const port = process.env.PORT || 4000;


// Middleware to parse JSON bodies
app.use(bodyParser.json());
// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
app.use(express.static('views'))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
      if (email === "baddour@test.com" && password === "baddour") {
          // Redirect to the home page (index.html)
          return res.redirect('/account.html'); // Change this if your home page is different
      }
      // If credentials are invalid, you can handle it here
      res.status(401).send("Invalid credentials");
  } catch (err) {
      console.error(err);
      res.status(400).send("Error logging in");
  }
});







// Start server
/*
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });

  */

module.exports = app; // Export the app for Vercel