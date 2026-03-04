const express = require('express');
const { signup, login, me, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);

module.exports = router;

