const userRepository = require('../repositories/user.js');
const bcrypt = require('bcrypt');

module.exports.register = async (req, res) => {
	const { username, password } = req.body;
	try {
		const hashed = await bcrypt.hash(password, 12);
		const rows = await userRepository.insertNewUser({ username, hashed });
		const user_id = rows[0].id;

		res.status(201).json({
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