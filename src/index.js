require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const db = require('./config/db.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

const userRouter = require('./routes/user.js');
const recipeRouter = require('./routes/recipes.js');

app.use('/api/user', userRouter);
app.use('/api/recipes', recipeRouter);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
