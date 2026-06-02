const express = require('express');

const userController = require('../controllers/user.js')
const authMiddleware = require('../middleware/auth.js');

const router = express.Router()

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', authMiddleware, userController.logout);

module.exports = router;
