const express = require('express');

const recipeController = require('../controllers/recipes.js');
const authMiddleware = require('../middleware/auth.js');

const router = express.Router()

router.post('/create_recipe', authMiddleware, recipeController.createRecipe);

module.exports = router;
