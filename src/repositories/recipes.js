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

module.exports.updateRecipe = async ({
	user_id,
	recipe_id,
	recipe_data,
	recipe_steps,
	recipe_ingredients,
}) => {
	const client = await db.connect();
	try {
		await client.query(`BEGIN`);

		const { rows } = await client.query(
			`
			UPDATE recipes
			SET title = $1,
				image_data = $2,
				cooking_time = $3,
				servings = $4,
				is_favorite = $5
			WHERE id = $6 AND user_id = $7
			RETURNING id
			`,
			[
				recipe_data.title,
				recipe_data.image_data,
				recipe_data.cooking_time,
				recipe_data.servings,
				recipe_data.is_favorite ?? false,
				recipe_id,
				user_id,
			]
		);

		if (rows.length === 0) {
			await client.query(`ROLLBACK`);
			return null;
		}

		await client.query(`DELETE FROM recipe_steps WHERE recipe_id = $1`, [recipe_id]);

		if (recipe_steps.length > 0) {
			const steps = [];
			const step_placeholders = [];
			recipe_steps.forEach((step, index) => {
				const offset = index * 3;
				step_placeholders.push(
					`($${offset + 1}, $${offset + 2}, $${offset + 3})`
				);
				steps.push(recipe_id, step.text, step.step_order);
			});

			await client.query(
				`
				INSERT INTO recipe_steps (recipe_id, text, step_order)
				VALUES ${step_placeholders.join(', ')}
				`,
				steps
			);
		}

		await client.query(
			`DELETE FROM recipe_ingredients WHERE recipe_id = $1`,
			[recipe_id]
		);

		if (recipe_ingredients.length > 0) {
			const ingredients = [];
			const ingredient_placeholders = [];
			recipe_ingredients.forEach((ingredient, index) => {
				const offset = index * 3;
				ingredient_placeholders.push(
					`($${offset + 1}, $${offset + 2}, $${offset + 3})`
				);
				ingredients.push(
					recipe_id,
					ingredient.text,
					ingredient.ingredient_order
				);
			});

			await client.query(
				`
				INSERT INTO recipe_ingredients (recipe_id, text, ingredient_order)
				VALUES ${ingredient_placeholders.join(', ')}
				`,
				ingredients
			);
		}

		await client.query(`COMMIT`);
		return recipe_id;
	} catch (err) {
		await client.query(`ROLLBACK`);
		throw err;
	} finally {
		client.release();
	}
};

module.exports.getRecipesForUser = async ({ id }) => {
	const { rows: recipes } = await db.query(
		`
		SELECT id, title, image_data, cooking_time, servings, is_favorite
		FROM recipes
		WHERE user_id = $1
		`,
		[id]
	);

	if (recipes.length === 0) {
		return [];
	}

	const recipeIds = recipes.map((recipe) => recipe.id);

	const { rows: steps } = await db.query(
		`
		SELECT recipe_id, text, step_order
		FROM recipe_steps
		WHERE recipe_id = ANY($1::uuid[])
		ORDER BY step_order
		`,
		[recipeIds]
	);

	const { rows: ingredients } = await db.query(
		`
		SELECT recipe_id, text, ingredient_order
		FROM recipe_ingredients
		WHERE recipe_id = ANY($1::uuid[])
		ORDER BY ingredient_order
		`,
		[recipeIds]
	);

	const stepsByRecipeId = new Map();
	for (const step of steps) {
		if (!stepsByRecipeId.has(step.recipe_id)) {
			stepsByRecipeId.set(step.recipe_id, []);
		}
		stepsByRecipeId.get(step.recipe_id).push({
			text: step.text,
			step_order: step.step_order,
		});
	}

	const ingredientsByRecipeId = new Map();
	for (const ingredient of ingredients) {
		if (!ingredientsByRecipeId.has(ingredient.recipe_id)) {
			ingredientsByRecipeId.set(ingredient.recipe_id, []);
		}
		ingredientsByRecipeId.get(ingredient.recipe_id).push({
			text: ingredient.text,
			ingredient_order: ingredient.ingredient_order,
		});
	}

	return recipes.map((recipe) => ({
		id: recipe.id,
		title: recipe.title,
		image_data: recipe.image_data,
		cooking_time: recipe.cooking_time,
		servings: recipe.servings,
		is_favorite: recipe.is_favorite,
		steps: stepsByRecipeId.get(recipe.id) ?? [],
		ingredients: ingredientsByRecipeId.get(recipe.id) ?? [],
	}));
};

module.exports.checkOwnership = async ({ id }) => {
	const { rows } = await db.query(
		`SELECT * FROM recipes WHERE id = $1`,
		[id]
	);
	return rows;
}

module.exports.deleteRecipe = async ({ id }) => {
	await db.query(
		`DELETE FROM recipes WHERE id = $1`,
		[id]
	)
};