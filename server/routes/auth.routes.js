const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/register-admin', authController.registerAdmin); // Be careful with this in production

module.exports = router;
