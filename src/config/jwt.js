const crypto = require('crypto');
const jwt = require('jsonwebtoken');

module.exports.signSessionToken = (userId) => {
	return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN || '7d',
	});
};

module.exports.hashSessionToken = (token) => {
	return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports.verifySessionToken = (token) => {
	return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports.getTokenExpiresAt = (token) => {
	const decoded = jwt.decode(token);
	return decoded?.exp ? new Date(decoded.exp * 1000) : null;
};
