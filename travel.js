const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const app = express();


app.use(express.json());
app.use(cors());


const mongourl = 'mongodb+srv://dharshini001:dharsh2005@cluster0.onf7x.mongodb.net/travelApp?retryWrites=true&w=majority';

mongoose.connect(mongourl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));


const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
});
const User = mongoose.model('User', userSchema);



const checklistSchema = new mongoose.Schema({
  location: String,
  items: String,
});
const Checklist = mongoose.model('Checklist', checklistSchema);



// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  place: String,
  feedback: String,
});
const Feedback = mongoose.model('Feedback', feedbackSchema);

// Plan Schema
const planSchema = new mongoose.Schema({
  source: String,
  destination: String,
  date: String,
});
const Plan = mongoose.model('Plan', planSchema);

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ error: "User registration failed" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, "your_jwt_secret_key", { expiresIn: "1h" });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Add Checklist
app.post('/checklists', async (req, res) => {
  const { location, items } = req.body;
  const newChecklist = new Checklist({ location, items });

  await newChecklist.save();
  res.send('Checklist added successfully');
});

// Get Checklists
app.get('/checklists', async (req, res) => {
  const checklists = await Checklist.find();
  res.json(checklists);
});

// Add Budget
const budgetSchema = new mongoose.Schema({
  location: { type: String, required: true },
  totalBudget: { type: Number, required: true },
  expenses: [
    {
      name: { type: String, required: true },
      amount: { type: Number, required: true }, // Renamed from 'item' to 'amount'
    },
  ],
});

const Budget = mongoose.model("Budget", budgetSchema);

// Add a new budget
app.post("/budget", async (req, res) => {
  try {
    const { location, totalBudget, expenses } = req.body;

    const newBudget = new Budget({
      location,
      totalBudget,
      expenses,
    });

    await newBudget.save();
    res.status(201).json({ message: "Budget added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error adding budget", details: error });
  }
});

// Get all budgets
app.get("/budget", async (req, res) => {
  try {
    const budgets = await Budget.find();
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: "Error fetching budgets", details: error });
  }
});


// Add Feedback
app.post("/feedbacks", async (req, res) => {
  try {
    const { place, feedback } = req.body;

    if (!place || !feedback) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const newFeedback = new Feedback({ place, feedback });
    await newFeedback.save();

    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error adding feedback:", error);
    res.status(500).json({ error: "Server error while saving feedback" });
  }
});

app.get("/feedbacks", async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({ error: "Server error while fetching feedbacks" });
  }
});

// Add Travel Plan
app.post('/plans', async (req, res) => {
  const { source, destination, date } = req.body;
  const newPlan = new Plan({ source, destination, date });

  await newPlan.save();
  res.send('Travel plan created successfully');
});

// Get Travel Plans
app.get('/plans', async (req, res) => {
  const plans = await Plan.find();
  res.json(plans);
});

// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


