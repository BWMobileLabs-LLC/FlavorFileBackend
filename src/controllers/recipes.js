const recipeRepository = require('../repositories/recipes.js');

module.exports.createRecipe = async (req, res) => {
	const { title, image_data, cooking_time, servings, is_favorite, steps, ingredients } = req.body;
	const recipe_data = { title, image_data, cooking_time, servings, is_favorite };

	try {
		const recipeId = await recipeRepository.createNewRecipe({
			user_id: req.userId,
			recipe_data,
			recipe_steps: steps ?? [],
			recipe_ingredients: ingredients ?? [],
		});
		res.status(201).json({ recipeId });
	} catch (err) {
		if (err.code === '23505') {
			return res.status(409).json({ message: 'Duplicate step or ingredient order' });
		}
		res.status(500).json({ message: 'Failed to add recipe' });
	}
};

module.exports.updateRecipe = async (req, res) => {
	const { recipe_id } = req.params;
	const { title, image_data, cooking_time, servings, is_favorite, steps, ingredients } = req.body;
	const recipe_data = { title, image_data, cooking_time, servings, is_favorite };

	try {
		const recipeId = await recipeRepository.updateRecipe({
			user_id: req.userId,
			recipe_id,
			recipe_data,
			recipe_steps: steps ?? [],
			recipe_ingredients: ingredients ?? [],
		});

		if (!recipeId) {
			return res.status(404).json({ message: 'Recipe not found' });
		}

		res.status(200).json({ recipeId });
	} catch (err) {
		if (err.code === '23505') {
			return res.status(409).json({ message: 'Duplicate step or ingredient order' });
		}
		res.status(500).json({ message: 'Failed to update recipe' });
	}
};
