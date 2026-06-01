const db = require('../config/db.js');

module.exports.createNewRecipe = async ({ user_id, recipe_data, recipe_steps, recipe_ingredients }) => {
	const client = await db.connect();
	try {
		await client.query(`BEGIN`);
		const { rows } = await client.query(
			`
			INSERT INTO recipes (user_id, title, image_data, cooking_time, servings, is_favorite)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING id
			`,
			[user_id, recipe_data.title, recipe_data.image_data, recipe_data.cooking_time, recipe_data.servings, recipe_data.is_favorite ?? false]
		);

		const recipeId = rows[0].id;

		const steps = [];
		const step_placeholders = [];
		recipe_steps.forEach((step, index) => {
			const offset = index * 3;
			step_placeholders.push(
				`($${offset + 1}, $${offset + 2}, $${offset + 3})`
			);

			steps.push(
				recipeId,
				step.text,
				step.step_order
			);
		});

		await client.query(
			`INSERT INTO recipe_steps (recipe_id, text, step_order)
			VALUES ${step_placeholders.join(", ")}`,
			steps
		);

		const ingredients = [];
		const ingredient_placeholders = [];
		recipe_ingredients.forEach((ingredient, index) => {
			const offset = index * 3;
			ingredient_placeholders.push(
				`($${offset + 1}, $${offset + 2}, $${offset + 3})`
			);

			ingredients.push(
				recipeId,
				ingredient.text,
				ingredient.ingredient_order
			);
		});

		await client.query(
			`INSERT INTO recipe_ingredients (recipe_id, text, ingredient_order)
			VALUES ${ingredient_placeholders.join(", ")}`,
			ingredients
		);

		await client.query(`COMMIT`);
		return recipeId;
	} catch (err) {
		await client.query(`ROLLBACK`);
		throw err;
	} finally {
		client.release();
	}
};