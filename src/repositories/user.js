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
	const client = await db.connect();
	try {
		await client.query(`BEGIN`);
		await client.query(
			`DELETE FROM sessions WHERE user_id = $1`,
			[userId]
		);
		const { rows } = await client.query(
			`
			INSERT INTO sessions (user_id, token_hash, expires_at)
			VALUES ($1, $2, $3)
			RETURNING id
			`,
			[userId, tokenHash, expiresAt]
		);
		await client.query(`COMMIT`);
		return rows;
	} catch (err) {
		await client.query(`ROLLBACK`);
		throw err;
	} finally {
		client.release();
	}
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

module.exports.findUserByUsername = async (username) => {
	const { rows } = await db.query(
		`
		SELECT id, username, password_hash
		FROM users
		WHERE username = $1
		`,
		[username]
	);
	return rows[0];
};