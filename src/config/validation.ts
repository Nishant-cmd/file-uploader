const { body } = require('express-validator');
const validateUser = [
  body('username')
    .trim()
    .isAlphanumeric()
    .withMessage('Username must contain only letters and numbers')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 1, max: 10 })
    .withMessage('Username must be between 1 and 10 characters long'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .notEmpty()
    .withMessage('Email is required')
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .notEmpty()
    .withMessage('Password is required')
    .matches('[0-9]')
    .withMessage('Password must contain at least one number')
    .matches('[A-Z]')
    .withMessage('Password must contain at least one uppercase letter'),
];

export default validateUser;
