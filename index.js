const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const port = process.env.PORT || 4000;
const URI = process.env.MONGO_URI;
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
const User = require("./models/User");

// Middleware to parse JSON bodies
app.use(bodyParser.json());
// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("public")); // Serve static files from public directory
app.set("view engine", "ejs"); // Set EJS as view engine

// MongoDB connection
mongoose
  .connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Session setup
app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: true,
  })
);

// Home route
app.get("/", (req, res) => {
  res.render("index"); // Render index.ejs
});

// Signup API
app.post("/api/signup", async (req, res) => {
  const { name, email, password, "confirm-password": confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).send("Passwords do not match.");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).redirect("/login");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating user");
  }
});

// API login endpoint
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send("Incorrect email or password.");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send("Incorrect email or password.");
    }

    req.session.userId = user._id; // Save user session ID
    console.log("User ID set in session:", req.session.userId); // Add this line for debugging
    res.redirect("/account"); // Redirect to account page
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
});


// Middleware to check if a user is logged in
const ensureAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/"); // Redirect to home if not authenticated
  }
  next();
};

// Routes for each page
app.get("/account", ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.redirect("/");

    res.render("account", { user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading account page");
  }
});

app.get("/login", (req, res) => {
  res.render("login"); // Render login.ejs
});

app.get("/signup", (req, res) => {
  res.render("signup"); // Render signup.ejs (make sure this file exists)
});

app.get("/funds", ensureAuthenticated, (req, res) => {
  res.render("funds", { title: "Add Funds" }); // Render funds.ejs
});

app.get("/profile", ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.redirect("/");

    res.render("profile", { user, title: "Profile" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading profile page");
  }
});

app.get("/order", ensureAuthenticated, async (req, res) => {
  res.render("order", { title: "New Order" }); // Render order.ejs
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app; // Export the app for Vercel
