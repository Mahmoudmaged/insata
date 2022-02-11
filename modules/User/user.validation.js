const { body } = require("express-validator");


const signUpValidator = [

    body("userName").isString().withMessage('in-valid userName validation'),
    body("email").isEmail().withMessage('in-valid email syntax'),
    body("password").isStrongPassword().withMessage('in-valid password'),
    body('passwordConfirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      }),

]


module.exports = {
    signUpValidator
}