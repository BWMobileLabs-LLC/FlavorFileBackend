const db = require('../config/db.js');

module.exports.insertNewUser = async ({ username, hashed }) => {
	const { rows } = await db.query(
		`
		INSERT INTO users (username, password_hash)
		VALUES ($1, $2)
		RETURNING id
		`,
		[username, hashed]
	);
	return rows;
}