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
const Transaction = require("./models/Transaction");
const path = require('path');



// Serve static files from the 'views/src' directory
app.use('/src', express.static(path.join(__dirname, 'src')));
// Middleware to parse JSON bodies
app.use(bodyParser.json());
// Serve static files from the public directory
app.use(express.static('public'));

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
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
    return res.render('signup', { error: "Passwords do not match." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('signup', { error: "Email already in use." });
    }

    // Log the password before hashing
    console.log("Password before hashing:", password);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password:", hashedPassword);
    let hash = hashedPassword
    const newUser = new User({ name:name, email:email, password: hash });
    await newUser.save();
    
    console.log("New user created:", newUser);
    res.status(201).redirect("/login");
  } catch (err) {
    console.error(err);
    return res.render('signup', { error: "Error creating user. Please try again." });
  }
});


// API login endpoint
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found"); // Debug log
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    console.log("User found:", user); // Debug log
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log("Password does not match"); // Debug log
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    req.session.userId = user._id; // Save user session ID
    console.log("User ID set in session:", req.session.userId); // Debug log
    res.json({ redirect: "/profile" }); // Send redirect URL in JSON
  } catch (err) {
    console.error("Login error:", err); // Log the error
    res.status(500).json({ message: "Error logging in", error: err.message }); // Include error message in response
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

    res.render("account", { user, title: "Account" }); // Set the title here
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading account page");
  }
});


//login render
app.get("/login", (req, res) => {
  res.render("login"); // Render login.ejs
});

// Render signup page
app.get("/signup", (req, res) => {
  res.render('signup', { error: null }); // Always pass error as null for the initial load
});



// Rendering Add Funds page
app.get("/funds", (req, res) => {
  if (!req.session.userId) {
      return res.redirect("/login"); // Redirect to login if not logged in
  }

  // Find the user by ID (or however you manage user sessions)
  User.findById(req.session.userId)
      .then(user => {
          if (!user) {
              return res.redirect("/login"); // Redirect if user not found
          }
          res.render("funds", { user }); // Pass user object to EJS template
      })
      .catch(err => {
          console.error(err);
          res.status(500).send("Internal server error");
      });
});


//profile render
app.get("/profile", ensureAuthenticated, async (req, res) => {
  try {
      const user = await User.findById(req.session.userId);
      if (!user) return res.redirect("/");

      const transactions = await Transaction.find({ userId: req.session.userId }); // Fetch user's transactions

      res.render("profile", { user, transactions, title: "Profile" }); // Pass transactions to view
  } catch (err) {
      console.error(err);
      res.status(500).send("Error loading profile page");
  }
});
//order render
app.get("/order", ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.redirect("/");

    res.render("order", { user, title: "New Order" }); // Pass user to the view
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading order page");
  }
});



// Contact Us GET route
app.get("/contact", async (req, res) => {
  const user = req.session.userId ? await User.findById(req.session.userId) : null;
  res.render("contact", { title: "Contact Us", user }); // Pass title and user to the EJS template
});

// Contact Us POST route
app.post("/submit-contact", async (req, res) => {
  const { name, email, message } = req.body;

  // Handle form submission logic (e.g., save to database, send an email, etc.)
  console.log('Contact Form Submission:', { name, email, message });

  // Redirect or respond to the user after processing
  res.redirect("/contact"); // Redirect back to the contact page after submission
});



// API endpoint to create a transaction
app.post("/api/transaction", ensureAuthenticated, async (req, res) => {
    const { amount, description, transactionType } = req.body;

    if (!amount || !description || !transactionType) {
        return res.status(400).send("All fields are required.");
    }

    try {
        const transaction = new Transaction({
            userId: req.session.userId,
            amount,
            description,
            transactionType,
        });
        await transaction.save();
        res.status(201).send("Transaction added successfully.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding transaction.");
    }
});

// API endpoint to get user's transactions
app.get("/api/transactions", ensureAuthenticated, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.session.userId });
        res.json(transactions);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving transactions.");
    }
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy(err => {
      if (err) {
          console.error(err);
          return res.status(500).send("Error logging out.");
      }
      res.redirect("/"); // Redirect to home page or login page
  });
});












/*
// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
*/
module.exports = app; // Export the app for Vercel
