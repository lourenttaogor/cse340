// Needed Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')

// Route to build login view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccount))
router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))
router.get('/logout', utilities.handleErrors(accountController.accountLogout))
router.get('/update/:account_id', utilities.checkLogin, utilities.handleErrors(accountController.buildAccountUpdate))


// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Update account information
router.post('/update', utilities.checkLogin, regValidate.updateRules(), regValidate.checkUpdateData, utilities.handleErrors(accountController.updateAccount))

// Change password
router.post('/password', utilities.checkLogin, regValidate.passwordRules(), regValidate.checkPasswordData, utilities.handleErrors(accountController.updatePassword))

module.exports = router