const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()

  const classificationList = await utilities.buildClassificationList()

  const message = req.flash() // get flash messages
  res.render('inventory/management', {
    title: 'Inventory Management',
    nav,
    message,
    classificationList,
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
    const classificationList = await utilities.buildClassificationList()
    return res.status(201).render('inventory/management', {
      title: 'Inventory Management',
      nav,
      message: req.flash(),
      classificationList,
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
/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render('./inventory/edit-inventory', {
    title: 'Edit ' + itemName,
    nav,
    classificationSelect: classificationSelect,
    classificationList: classificationSelect, // also provide the old name used in the view
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  })
}

/* Update Inventory Data handled in single implementation later in file */

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

/* ***************************
 * Build inventory edit view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  const inv_id = req.params.inv_id
  try {
    const data = await invModel.getVehicleById(inv_id)
    if (!data) {
      return res.status(404).render('errors/error', { title: 404, message: 'Vehicle not found', nav: await utilities.getNav() })
    }
    let nav = await utilities.getNav()

    const classificationList = await utilities.buildClassificationList(data.classification_id)
    
    res.render('inventory/edit-inventory', {
      title: `Edit ${data.inv_make} ${data.inv_model}`,
      nav,
      classificationList,
      inv_id: data.inv_id,
      inv_make: data.inv_make,
      inv_model: data.inv_model,
      inv_year: data.inv_year,
      inv_description: data.inv_description,
      inv_image: data.inv_image,
      inv_thumbnail: data.inv_thumbnail,
      inv_price: data.inv_price,
      inv_miles: data.inv_miles,
      inv_color: data.inv_color,
      classification_id: data.classification_id,
      errors: null,
    })
  } catch (error) {
    console.error('buildEditInventory error: ', error)
    next(error)
  }
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  try {
    const item = await invModel.getInventoryById(inv_id)
    if (!item) {
      return res.status(404).render('errors/error', { title: 404, message: 'Vehicle not found', nav: await utilities.getNav() })
    }
    let nav = await utilities.getNav()
    // Use edit Inventory view fields but limited
    res.render('inventory/delete-confirm', {
      title: `Delete ${item.inv_make} ${item.inv_model}`,
      nav,
      errors: null,
      inv_id: item.inv_id,
      inv_make: item.inv_make,
      inv_model: item.inv_model,
      inv_year: item.inv_year,
      inv_price: item.inv_price,
    })
  } catch (error) {
    console.error('buildDeleteInventory error: ', error)
    next(error)
  }
}

/* ***************************
 *  Process delete inventory
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.body.inv_id)
  try {
    const result = await invModel.deleteInventoryItem(inv_id)
    if (result && result.rowCount > 0) {
      const deleted = result.rows[0]
      const itemName = `${deleted.inv_make} ${deleted.inv_model}`
      req.flash('notice', `${itemName} deleted successfully.`)
      nav = await utilities.getNav()
      const classificationList = await utilities.buildClassificationList()
      return res.status(200).render('inventory/management', { title: 'Inventory Management', nav, message: req.flash(), classificationList })
    }
    req.flash('notice', 'Sorry, deleting inventory failed.')
    return res.redirect(`/inv/delete/${inv_id}`)
  } catch (error) {
    console.error('deleteInventory controller error: ', error)
    req.flash('notice', 'Sorry, deleting inventory failed.')
    return res.redirect(`/inv/delete/${inv_id}`)
  }
}

/* ***************************
 *  Process update inventory
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let { inv_id, classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
  inv_id = parseInt(inv_id)
  classification_id = parseInt(classification_id)
  inv_price = parseInt(inv_price)
  inv_miles = parseInt(inv_miles)
  try {
    const result = await invModel.updateInventory(inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
    if (result && result.rowCount > 0) {
      req.flash('notice', `${inv_make} ${inv_model} updated successfully.`)
      nav = await utilities.getNav()
      const classificationList = await utilities.buildClassificationList()
      return res.status(200).render('inventory/management', {
        title: 'Inventory Management',
        nav,
        message: req.flash(),
        classificationList,
      })
    }
  } catch (error) {
    console.error('updateInventory controller error: ', error)
    req.flash('notice', 'Sorry, updating inventory failed.')
    const classificationList = await utilities.buildClassificationList(classification_id)
    return res.status(500).render('inventory/edit-inventory', {
      title: 'Edit Inventory',
      nav,
      classificationList,
      errors: null,
      inv_id,
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
  // failure path
  req.flash('notice', 'Sorry, updating inventory failed.')
  const classificationList = await utilities.buildClassificationList(classification_id)
  return res.status(400).render('inventory/edit-inventory', {
    title: 'Edit Inventory',
    nav,
    classificationList,
    errors: null,
    inv_id,
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
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

module.exports = invCont