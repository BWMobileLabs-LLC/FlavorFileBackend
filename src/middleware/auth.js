const jwt = require('../config/jwt.js');
const userRepository = require('../repositories/user.js');

module.exports = async (req, res, next) => {
	const header = req.headers.authorization;
	if (!header?.startsWith('Bearer ')) {
		return res.status(401).json({ message: 'Missing or invalid authorization' });
	}

	const token = header.slice(7);

	try {
		const payload = jwt.verifySessionToken(token);
		const userId = payload.sub;
		if (!userId) {
			return res.status(401).json({ message: 'Invalid or expired token' });
		}

		const session = await userRepository.findValidSession(jwt.hashSessionToken(token));
		if (!session || session.user_id !== userId) {
			return res.status(401).json({ message: 'Invalid or expired token' });
		}

		req.userId = userId;
		next();
	} catch {
		return res.status(401).json({ message: 'Invalid or expired token' });
	}
};
