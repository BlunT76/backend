const { check } = require('express-validator/check');

module.exports = {
  validateMeChecks: [
    check('name')
      .exists()
      .isLength({ min: 1, max: 50 })
      .withMessage('The name field is required or maximal length reached 50)')
      .trim(),

    check('latitude')
      .exists()
      .isFloat({ min: -90, max: 90 })
      .withMessage('The Latitude field is required. Valid latitude values are between -90 and 90, both inclusive.')
      .trim(),

    check('longitude')
      .exists()
      .isFloat({ min: -180, max: 180 })
      .withMessage('The Longitude field is required. Valid longitude values are between -180 and 180, both inclusive.')
      .trim(),
  ],
  validateLogin: [
    check('name')
      .exists()
      .isLength({ min: 1, max: 50 })
      .withMessage('The name field is required')
      .trim(),

    check('passwd')
      .exists()
      .isLength({ min: 1, max: 50 })
      .withMessage('The password field is required')
      .trim(),
  ],
};
