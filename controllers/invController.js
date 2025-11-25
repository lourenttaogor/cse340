const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  const message = req.flash() // get flash messages
  res.render('inventory/management', {
    title: 'Inventory Management',
    nav,
    message,
  })
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render('inventory/add-classification', {
    title: 'Add Classification',
    nav,
    errors: null,
    classification_name: null,
  })
}

/* ***************************
 *  Process add classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body
  try {
    const result = await invModel.addClassification(classification_name)
    if (result && result.rowCount > 0) {
    req.flash('notice', `${classification_name} added successfully.`)
    // Rebuild nav so new classification appears
    nav = await utilities.getNav()
    return res.status(201).render('inventory/management', {
      title: 'Inventory Management',
      nav,
      message: req.flash(),
    })
  }
  } catch (error) {
    console.error('addClassification controller error: ', error)
    req.flash('notice', 'Sorry, adding classification failed.')
    return res.status(500).render('inventory/add-classification', {
      title: 'Add Classification',
      nav,
      errors: null,
      classification_name,
    })
  }
  req.flash('notice', 'Sorry, adding classification failed.')
  return res.status(400).render('inventory/add-classification', {
    title: 'Add Classification',
    nav,
    errors: null,
    classification_name,
  })
}

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render('inventory/add-inventory', {
    title: 'Add Inventory',
    nav,
    classificationList,
    errors: null,
  })
}

/* ***************************
 *  Process add inventory
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
  try {
    const result = await invModel.addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
    if (result && result.rowCount > 0) {
    req.flash('notice', `${inv_make} ${inv_model} added successfully.`)
    // render management with updated nav
    nav = await utilities.getNav()
    return res.status(201).render('inventory/management', {
      title: 'Inventory Management',
      nav,
      message: req.flash(),
    })
  }
  } catch (error) {
    console.error('addInventory controller error: ', error)
    req.flash('notice', 'Sorry, adding inventory failed.')
    const classificationList = await utilities.buildClassificationList(classification_id)
    return res.status(500).render('inventory/add-inventory', {
      title: 'Add Inventory',
      nav,
      classificationList,
      errors: null,
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
  }
  // failure - show add-inventory with sticky values and error flash
  req.flash('notice', 'Sorry, adding inventory failed.')
  const classificationList = await utilities.buildClassificationList(classification_id)
  return res.status(400).render('inventory/add-inventory', {
    title: 'Add Inventory',
    nav,
    classificationList,
    errors: null,
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
}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildVehicleDetail = async function (req, res, next) {
  const inv_id = req.params.inv_id
  const data = await invModel.getVehicleById(inv_id)
  const detail = await utilities.buildVehicleDetail(data)
  let nav = await utilities.getNav()
  const title = data.inv_make + " " + data.inv_model
  res.render("./inventory/detail", {
    title: title,
    nav,
    detail,
  })
}

module.exports = invCont