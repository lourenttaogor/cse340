const invModel = require("../models/inventory-model")
const Util = {}

// Simple function to escape HTML entities to prevent DOM XSS when building HTML strings
function escapeHTML (str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      escapeHTML(row.classification_name) +
      ' vehicles">' +
      escapeHTML(row.classification_name) +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid += '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + escapeHTML(vehicle.inv_thumbnail) 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + escapeHTML(vehicle.inv_make) + ' ' + escapeHTML(vehicle.inv_model) + ' details">' 
      + escapeHTML(vehicle.inv_make) + ' ' + escapeHTML(vehicle.inv_model) + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
 * Build a select list of classifications
 * Returns HTML for a <select> element with options
 * Accepts an optional classification_id to mark selected
 ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (classification_id != null && row.classification_id == classification_id) {
      classificationList += ' selected '
    }
    classificationList += '>' + escapeHTML(row.classification_name) + '</option>'
  })
  classificationList += '</select>'
  return classificationList
}

/* **************************************
* Build the vehicle detail view HTML
* ************************************ */
Util.buildVehicleDetail = async function(data){
  let detail = '<div class="detail-container">'
  detail += '<div class="detail-image">'
  detail += '<img src="' + escapeHTML(data.inv_image) + '" alt="Image of ' + escapeHTML(data.inv_make) + ' ' + escapeHTML(data.inv_model) + ' on CSE Motors" />'
  detail += '</div>'
  detail += '<div class="detail-content">'
  // Prominent heading with year, make, model
  detail += '<h2 class="vehicle-title">' + escapeHTML(data.inv_year) + ' ' + escapeHTML(data.inv_make) + ' ' + escapeHTML(data.inv_model) + '</h2>'
  // Prominent price
  detail += '<p class="vehicle-price"><strong>Price:</strong> <span class="price">$' + new Intl.NumberFormat('en-US').format(data.inv_price) + '</span></p>'
  // Mileage
  detail += '<p><strong>Mileage:</strong> <span class="miles">' + new Intl.NumberFormat('en-US').format(data.inv_miles) + '</span> miles (actual miles driven)</p>'
  // Color
  detail += '<p><strong>Color:</strong> <span class="color">' + escapeHTML(data.inv_color) + '</span> (exterior paint)</p>'
  // Description
  detail += '<p><strong>Description:</strong> <span class="desc">' + escapeHTML(data.inv_description) + '</span></p>'
  detail += '</div>'
  detail += '</div>'
  return detail
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util