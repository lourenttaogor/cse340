const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav
  try {
    nav = await utilities.getNav()
  } catch (error) {
    console.error('buildLogin getNav error', error)
    nav = '<ul><li><a href="/">Home</a></li></ul>'
  }
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email: null,
  })
}
/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav
  try {
    nav = await utilities.getNav()
  } catch (error) {
    console.error('buildRegister getNav error', error)
    nav = '<ul><li><a href="/">Home</a></li></ul>'
  }
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccount(req, res, next) {
  let nav
  try {
    nav = await utilities.getNav()
  } catch (error) {
    console.error('buildAccount getNav error', error)
    nav = '<ul><li><a href="/">Home</a></li></ul>'
  }
  const message = req.flash()
  res.render('account/index', {
    title: 'Account',
    nav,
    message,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // use async hash
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  // regResult should be a query result with rowCount === 1 on success
  if (regResult && regResult.rowCount && regResult.rowCount > 0) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    return res.redirect(302, "/account/login")
  }

  req.flash("notice", "Sorry, the registration failed.")
  return res.status(400).redirect('/account/register')
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET || 'development-secret', { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Process logout (clear cookie and session)
 * *************************************** */
async function accountLogout(req, res, next) {
  // Clear JWT cookie and properly destroy session
  try {
    res.clearCookie('jwt')
    // Clear session cookie from client
    res.clearCookie('sessionId')
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session during logout:', err)
          return next(err)
        }
        req.flash('notice', 'You have been logged out.')
        return res.redirect('/')
      })
    } else {
      req.flash('notice', 'You have been logged out.')
      return res.redirect('/')
    }
  } catch (error) {
    console.error('Logout processing error:', error)
    next(error)
  }
}

/* ****************************************
 *  Build account update view
 * *************************************** */
async function buildAccountUpdate(req, res, next) {
  const account_id = parseInt(req.params.account_id)
  // Ensure logged-in user is same as requested id
  const loggedIn = res.locals.accountData
  if (!loggedIn || (loggedIn.account_id !== account_id && loggedIn.account_type !== 'Admin')) {
    req.flash('notice', 'You are not authorized to access that account.')
    return res.redirect('/account/')
  }
  let nav = await utilities.getNav()
  try {
    const account = await accountModel.getAccountById(account_id)
    if (!account) {
      req.flash('notice', 'Account not found')
      return res.redirect('/account/')
    }
    res.render('account/update-account', {
      title: 'Update Account',
      nav,
      errors: null,
      account_id: account.account_id,
      account_firstname: account.account_firstname,
      account_lastname: account.account_lastname,
      account_email: account.account_email,
    })
  } catch (error) {
    console.error('buildAccountUpdate error:', error)
    next(error)
  }
}

/* ****************************************
 *  Process account update (name/email)
 * *************************************** */
async function updateAccount(req, res, next) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  const id = parseInt(account_id)
  // Only allow owner or admin
  const loggedIn = res.locals.accountData
  if (!loggedIn || (loggedIn.account_id !== id && loggedIn.account_type !== 'Admin')) {
    req.flash('notice', 'You are not authorized to update this account.')
    return res.redirect('/account/')
  }
  try {
    const result = await accountModel.updateAccount(id, account_firstname, account_lastname, account_email)
    if (result && result.rowCount > 0) {
      const updated = result.rows[0]
      // Get the freshest account info (without password)
      const newAccount = await accountModel.getAccountById(id)
      delete newAccount.account_password
      // re-sign JWT to reflect updated details
      const accessToken = jwt.sign(newAccount, process.env.ACCESS_TOKEN_SECRET || 'development-secret', { expiresIn: 3600 * 1000 })
      if (process.env.NODE_ENV === 'development') {
        res.cookie('jwt', accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie('jwt', accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      req.flash('notice', 'Account updated successfully.')
      return res.redirect('/account/')
    }
    req.flash('notice', 'Account update failed.')
    return res.redirect(`/account/update/${id}`)
  } catch (error) {
    console.error('updateAccount controller error:', error)
    req.flash('notice', 'Account update failed.')
    next(error)
  }
}

/* ****************************************
 *  Process password update
 * *************************************** */
async function updatePassword(req, res, next) {
  const { account_id, account_password } = req.body
  const id = parseInt(account_id)
  // Only allow owner or admin
  const loggedIn = res.locals.accountData
  if (!loggedIn || (loggedIn.account_id !== id && loggedIn.account_type !== 'Admin')) {
    req.flash('notice', 'You are not authorized to update this account password.')
    return res.redirect('/account/')
  }
  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const result = await accountModel.updatePassword(id, hashedPassword)
    if (result && result.rowCount > 0) {
      // Refresh JWT cookie so TTL is reset
      const newAccount = await accountModel.getAccountById(id)
      if (newAccount) {
        const accessToken = jwt.sign(newAccount, process.env.ACCESS_TOKEN_SECRET || 'development-secret', { expiresIn: 3600 * 1000 })
        if (process.env.NODE_ENV === 'development') {
          res.cookie('jwt', accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
        } else {
          res.cookie('jwt', accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
        }
      }
      req.flash('notice', 'Password updated successfully.')
      return res.redirect('/account/')
    }
    req.flash('notice', 'Password update failed.')
    return res.redirect(`/account/update/${id}`)
  } catch (error) {
    console.error('updatePassword controller error:', error)
    req.flash('notice', 'Password update failed. Please try again.')
    next(error)
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccount, accountLogout, buildAccountUpdate, updateAccount, updatePassword }