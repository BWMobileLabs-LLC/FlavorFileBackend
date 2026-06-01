const recipeRepository = require('../repositories/recipes.js');

module.exports.createRecipe = async (req, res) => {
	const { title, image_data, cooking_time, servings, is_favorite, steps, ingredients } = req.body;
	const user_id = req.userId;
	const recipe_data = {
		title,
		image_data,
		cooking_time,
		servings,
		is_favorite
	}
	try {
		const recipeId = await recipeRepository.createNewRecipe({
			user_id,
			recipe_data,
			recipe_steps: steps,
			recipe_ingredients: ingredients
		});
		return res.status(201).json({
			recipeId
		});
	} catch (err) {
		console.log(err);
		return res.status(501).json({ message: 'Failed to add recipe' });
	}
};
