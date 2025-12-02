const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const accountModel = require("../models/account-model")

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the database
        body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (emailExists){
            throw new Error("Email exists. Please log in or use different email")
            }
        }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }


/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* **********************
 * Login Data Validation Rules
 ********************* */
validate.loginRules = () => {
  return [
    body('account_email')
      .trim()
      .isEmail()
      .withMessage('Please enter a valid email address.'),
    body('account_password')
      .trim()
      .notEmpty()
      .withMessage('A password is required.'),
  ]
}

validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render('account/login', {
      title: 'Login',
      nav,
      errors,
      account_email,
    })
    return
  }
  next()
}

/* ******************************
 * Account Update Data Validation Rules
 ***************************** */
validate.updateRules = () => {
  return [
    body('account_firstname')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('Please provide a first name.'),
    body('account_lastname')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('Please provide a last name.'),
    body('account_email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('A valid email is required.')
      .custom(async (value, { req }) => {
        // if email exists and belongs to a different account id, throw
        const existing = await accountModel.checkExistingEmail(value)
        // checkExistingEmail returns a count > 0 if exists; we need to fetch account by id to compare
        if (existing) {
          const account = await accountModel.getAccountByEmail(value)
          if (account && account.account_id != req.body.account_id) {
            throw new Error('Email exists. Please use a different email or keep current one.')
          }
        }
        return true
      }),
  ]
}

validate.checkUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render('account/update-account', {
      title: 'Update Account',
      nav,
      errors,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* ******************************
 * Password Change Validation
 ***************************** */
validate.passwordRules = () => {
  return [
    body('account_password')
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage('Password does not meet requirements.'),
  ]
}

validate.checkPasswordData = async (req, res, next) => {
  const { account_id } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    // We'll get the account so we can render sticky values if needed
    const account = await accountModel.getAccountById(account_id)
    res.render('account/update-account', {
      title: 'Update Account',
      nav,
      errors,
      account_id: account ? account.account_id : account_id,
      account_firstname: account ? account.account_firstname : '',
      account_lastname: account ? account.account_lastname : '',
      account_email: account ? account.account_email : '',
    })
    return
  }
  next()
}

module.exports = validate