const express = require('express');
const app = express();
const port = 5000;
const mongoose = require('mongoose');
const Question = require('./Models/questModels');
const User = require('./Models/userModels');
const fs = require('fs');
const cors = require('cors'); // Import the cors package

app.use(cors()); // Set up the cors package to allow cross-origin requests from any domain

const url = 'mongodb+srv://austonks:password12345@cluster0.erjexty.mongodb.net/trivquest?retryWrites=true&w=majority';

app.get('/users/nameofuser', async (req, res) => {
  try {
    const result = await User.aggregate([
      {
        $group: {
          _id: '$name',
        }
      },
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/users/most-correct-answers', async (req, res) => {
  try {
    const result = await User.aggregate([
      {
        $group: {
          _id: '$name',
          totalCorrectAnswers: { $sum: '$totalCorrectAnswers' }
        }
      },
      {
        $sort: { totalCorrectAnswers: -1 }
      },
      {
        $limit: 3
      }
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to database');

    // Check if the questions collection is empty
    const questionsCount = await Question.countDocuments();
    if (questionsCount === 0) {
      const questions = JSON.parse(fs.readFileSync('./questions.json', 'utf8'));

      Question.insertMany(questions)
        .then(() => {
          console.log('Questions inserted successfully!');
        })
        .catch((err) => {
          console.log('Error inserting questions:', err);
        });
    }

    // Check if the users collection is empty
    const usersCount = await User.countDocuments();
    if (usersCount === 0) {
      const users = [{ name: 'John Doe', totalQuestionsAnswered: 10, totalCorrectAnswers: 7 }];

      User.insertMany(users)
        .then(() => {
          console.log('Users inserted successfully!');
        })
        .catch((err) => {
          console.log('Error inserting users:', err);
        });
    }
  })
  .catch(() => {
    console.log('Connection error');
  });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => res.status(200).json({ message: 'Here is the backend' }));

app.get('/questions', async (req, res) => {
  try {
    const questions = await Question.find();
    console.log(questions);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    console.log(users);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { name, totalQuestionsAnswered, totalCorrectAnswers } = req.body;
    const user = new User({ name, totalQuestionsAnswered, totalCorrectAnswers });
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

