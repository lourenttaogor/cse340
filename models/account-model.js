const pool = require("../database/")


/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* ***************************
 * Get account by account_id
 * ************************** */
async function getAccountById(account_id) {
  try {
    const sql = 'SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1'
    const result = await pool.query(sql, [account_id])
    return result.rows[0]
  } catch (error) {
    console.error('getAccountById error:', error)
    return null
  }
}

/* ***************************
 * Update account information
 * ************************** */
async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = 'UPDATE account SET account_firstname = $2, account_lastname = $3, account_email = $4 WHERE account_id = $1 RETURNING *'
    const result = await pool.query(sql, [account_id, account_firstname, account_lastname, account_email])
    return result
  } catch (error) {
    console.error('updateAccount error:', error)
    throw error
  }
}

/* ***************************
 * Update account password
 * ************************** */
async function updatePassword(account_id, hashedPassword) {
  try {
    const sql = 'UPDATE account SET account_password = $2 WHERE account_id = $1 RETURNING *'
    const result = await pool.query(sql, [account_id, hashedPassword])
    return result
  } catch (error) {
    console.error('updatePassword error:', error)
    throw error
  }
}

/* ***************************
 * Delete account by account_id
 * ************************** */
async function deleteAccount(account_id) {
  try {
    const sql = 'DELETE FROM account WHERE account_id = $1 RETURNING account_id'
    const result = await pool.query(sql, [account_id])
    return result
  } catch (error) {
    console.error('deleteAccount error:', error)
    throw error
  }
}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAccountById, updateAccount, updatePassword, deleteAccount }