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
};

module.exports.insertSession = async ({ userId, tokenHash, expiresAt }) => {
	const { rows } = await db.query(
		`
		INSERT INTO sessions (user_id, token_hash, expires_at)
		VALUES ($1, $2, $3)
		RETURNING id
		`,
		[userId, tokenHash, expiresAt]
	);
	return rows;
};

module.exports.findValidSession = async (tokenHash) => {
	const { rows } = await db.query(
		`
		SELECT user_id
		FROM sessions
		WHERE token_hash = $1 AND expires_at > now()
		`,
		[tokenHash]
	);
	return rows[0];
};