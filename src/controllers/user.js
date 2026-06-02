const userRepository = require('../repositories/user.js');
const bcrypt = require('bcrypt');
const jwt = require('../config/jwt.js');

module.exports.register = async (req, res) => {
	const { username, password } = req.body;
	try {
		const hashed = await bcrypt.hash(password, 12);
		const rows = await userRepository.insertNewUser({ username, hashed });
		const user_id = rows[0].id;
		const token = jwt.signSessionToken(user_id);
		await userRepository.insertSession({
			userId: user_id,
			tokenHash: jwt.hashSessionToken(token),
			expiresAt: jwt.getTokenExpiresAt(token),
		});

		res.status(201).json({
			token,
			user: {
				id: user_id,
				username
			}
		});
	} catch (err) {
		if (err.code === '23505') {
			return res.status(409).json({ message: 'Username already in use' });
		}
		res.status(500).json({ message: 'Failed to register user' });
	}
}

module.exports.login = async (req, res) => {
	const { username, password } = req.body;
	try {
		const user = await userRepository.findUserByUsername(username);
		if (!user) {
			return res.status(401).json({ message: 'Username or password is incorrect' });
		}

		const valid = await bcrypt.compare(password, user.password_hash);
		if (!valid) {
			return res.status(401).json({ message: 'Username or password is incorrect' });
		}

		const token = jwt.signSessionToken(user.id);
		await userRepository.insertSession({
			userId: user.id,
			tokenHash: jwt.hashSessionToken(token),
			expiresAt: jwt.getTokenExpiresAt(token),
		});

		res.status(200).json({
			token,
			user: {
				id: user.id,
				username: user.username,
			},
		});
	} catch (err) {
		res.status(500).json({ message: 'Failed to log in' });
	}
};

module.exports.logout = async (req, res) => {
	const userId = req.userId;
	try {
		await userRepository.deleteUserSessions(userId);
		return res.sendStatus(204);
	} catch (err) {
		console.log(err);
		return res.sendStatus(204);
	}
}