const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post("/", async (req, res) => {
    const { email, password } = req.body;
    try {
        if (email === "baddour@test.com" && password === "baddour") {
            return res.redirect('/account.html'); // Adjust path as necessary
        }
        res.status(401).send("Invalid credentials");
    } catch (err) {
        console.error(err);
        res.status(400).send("Error logging in");
    }
});

module.exports = app; // Export the app for Vercel
