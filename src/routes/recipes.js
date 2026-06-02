const express = require('express');

const recipeController = require('../controllers/recipes.js');
const authMiddleware = require('../middleware/auth.js');

const router = express.Router()

router.post('/create_recipe', authMiddleware, recipeController.createRecipe);
router.put('/:recipe_id', authMiddleware, recipeController.updateRecipe);
router.delete('/:id', authMiddleware, recipeController.deleteRecipe);
router.get('/', authMiddleware, recipeController.getRecipes);

module.exports = router;
