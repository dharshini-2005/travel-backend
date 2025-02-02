
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
const mongourl = 'mongodb+srv://dharshini001:dharsh2005@cluster0.onf7x.mongodb.net/travelApp?retryWrites=true&w=majority';

mongoose.connect(mongourl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ Error connecting to MongoDB:', err));

// User Schema & Model
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true, required: true },
  password: String,
});
const User = mongoose.model('User', userSchema);

// Checklist Schema & Model
const checklistSchema = new mongoose.Schema({
  location: String,
  items: String,
});
const Checklist = mongoose.model('Checklist', checklistSchema);

// Feedback Schema & Model
const feedbackSchema = new mongoose.Schema({
  place: String,
  feedback: String,
});
const Feedback = mongoose.model('Feedback', feedbackSchema);

// Travel Plan Schema & Model
const planSchema = new mongoose.Schema({
  source: String,
  destination: String,
  date: String,
});
const Plan = mongoose.model('Plan', planSchema);

// Budget Schema & Model
const budgetSchema = new mongoose.Schema({
  location: { type: String, required: true },
  totalBudget: { type: Number, required: true },
  expenses: [
    {
      name: { type: String, required: true },
      amount: { type: Number, required: true },
    },
  ],
});
const Budget = mongoose.model("Budget", budgetSchema);

// 🔹 User Registration
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required!" });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("❌ Registration Error:", error.message);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
});

// 🔹 User Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid email or password!" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "your_jwt_secret_key", { expiresIn: "1h" });

    res.status(200).json({ token, message: "Login successful!" });
  } catch (error) {
    console.error("❌ Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 Add Checklist
app.post('/checklists', async (req, res) => {
  try {
    const { location, items } = req.body;
    if (!location || !items) {
      return res.status(400).json({ error: "Location and items are required!" });
    }

    const newChecklist = new Checklist({ location, items });
    await newChecklist.save();
    res.status(201).json({ message: "Checklist added successfully!" });
  } catch (error) {
    console.error("❌ Error adding checklist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 Get Checklists
app.get('/checklists', async (req, res) => {
  try {
    const checklists = await Checklist.find();
    res.status(200).json(checklists);
  } catch (error) {
    console.error("❌ Error fetching checklists:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 Add Budget
app.post("/budget", async (req, res) => {
  try {
    const { location, totalBudget, expenses } = req.body;
    if (!location || !totalBudget || !expenses) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const newBudget = new Budget({ location, totalBudget, expenses });
    await newBudget.save();
    res.status(201).json({ message: "Budget added successfully!" });
  } catch (error) {
    console.error("❌ Error adding budget:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 Get Budgets
app.get("/budget", async (req, res) => {
  try {
    const budgets = await Budget.find();
    res.status(200).json(budgets);
  } catch (error) {
    console.error("❌ Error fetching budgets:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 Add Feedback
app.post("/feedbacks", async (req, res) => {
  try {
    const { place, feedback } = req.body;
    if (!place || !feedback) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const newFeedback = new Feedback({ place, feedback });
    await newFeedback.save();
    res.status(201).json({ message: "Feedback submitted successfully!" });
  } catch (error) {
    console.error("❌ Error adding feedback:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 Get Feedbacks
app.get("/feedbacks", async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("❌ Error fetching feedbacks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 Add Travel Plan
app.post('/plans', async (req, res) => {
  try {
    const { source, destination, date } = req.body;
    if (!source || !destination || !date) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const newPlan = new Plan({ source, destination, date });
    await newPlan.save();
    res.status(201).json({ message: "Travel plan created successfully!" });
  } catch (error) {
    console.error("❌ Error adding plan:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 Get Travel Plans
app.get('/plans', async (req, res) => {
  try {
    const plans = await Plan.find();
    res.status(200).json(plans);
  } catch (error) {
    console.error("❌ Error fetching plans:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 Start Server
const port = 3000;
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
