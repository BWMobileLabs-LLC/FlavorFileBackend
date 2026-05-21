
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
	await knex.raw(
		`
		CREATE TABLE users (
			id				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			username		VARCHAR(80) NOT NULL,
			password_hash 	VARCHAR(255) NOT NULL,
			CONSTRAINT users_username_unique UNIQUE (username)
		);

		CREATE TABLE sessions (
			id			UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id		UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			token_hash	TEXT NOT NULL,
			created_at 	TIMESTAMPTZ NOT NULL DEFAULT now(),
			expires_at	TIMESTAMPTZ NOT NULL DEFAULT now() + interval '7 days'
		);

		CREATE TABLE recipes (
			id				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id			UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			title			VARCHAR(255) NOT NULL,
			image_data		TEXT,
			cooking_time	VARCHAR(255),
			servings		VARCHAR(255),
			is_favorite		BOOLEAN NOT NULL DEFAULT false
		);

		CREATE TABLE recipe_steps (
			id				UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			recipe_id		UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
			text			TEXT NOT NULL,
			step_order 		INT NOT NULL,
			CONSTRAINT		recipe_steps_order_unique UNIQUE(recipe_id, step_order)
		);

		CREATE TABLE recipe_ingredients (
			id					UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			recipe_id			UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
			text				TEXT NOT NULL,
			ingredient_order 	INT NOT NULL,
			CONSTRAINT			recipe_ingredients_order_unique UNIQUE(recipe_id, ingredient_order)
		);
		`
	)
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
	await knex.raw(
		`
		DROP TABLE IF EXISTS sessions;
		DROP TABLE IF EXISTS recipe_steps;
		DROP TABLE IF EXISTS recipe_ingredients;
		DROP TABLE IF EXISTS recipes;
		DROP TABLE IF EXISTS users;
		`
	)
};
