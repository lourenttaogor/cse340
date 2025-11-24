const { body, validationResult } = require('express-validator')
const validate = {}

validate.classificationRules = () => {
  return [
    body('classification_name')
      .trim()
      .notEmpty()
      .withMessage('Classification name is required.')
      .isAlphanumeric()
      .withMessage('Classification name cannot contain spaces or special characters.'),
  ]
}

validate.checkClassification = async (req, res, next) => {
  const { classification_name } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await require('./index').getNav()
    res.render('inventory/add-classification', {
      title: 'Add Classification',
      nav,
      errors,
      classification_name,
    })
    return
  }
  next()
}

validate.inventoryRules = () => {
  return [
    body('classification_id').notEmpty().withMessage('Please select a classification.'),
    body('inv_make').trim().notEmpty().withMessage('Make is required.'),
    body('inv_model').trim().notEmpty().withMessage('Model is required.'),
    body('inv_year').trim().isLength({ min: 4, max: 4 }).withMessage('Year must be 4 characters.'),
    body('inv_description').trim().notEmpty().withMessage('Description is required.'),
    body('inv_price').notEmpty().isNumeric().withMessage('Price must be a number.'),
    body('inv_miles').notEmpty().isInt().withMessage('Miles must be an integer.'),
    body('inv_color').trim().notEmpty().withMessage('Color is required.'),
    body('inv_image').trim().notEmpty().withMessage('Image path is required.'),
    body('inv_thumbnail').trim().notEmpty().withMessage('Thumbnail path is required.'),
  ]
}

validate.checkInventory = async (req, res, next) => {
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let utilities = require('./index')
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(classification_id)
    res.render('inventory/add-inventory', {
      title: 'Add Inventory',
      nav,
      errors,
      classificationList,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    })
    return
  }
  next()
}

module.exports = validate
