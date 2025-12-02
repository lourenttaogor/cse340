const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}


/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error " + error)
  }
}

/* ***************************
 *  Get a specific vehicle by inventory id
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory 
      WHERE inv_id = $1`,
      [inv_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getVehicleById error " + error)
  }
}

/* ***************************
 *  Alias: Get inventory by id (same as getVehicleById)
 * ************************** */
async function getInventoryById(inv_id) {
  return await getVehicleById(inv_id)
}

 

/* ***************************
 *  Add a new classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    console.error("addClassification error " + error)
    throw error
  }
}

/* ***************************
 *  Add a new inventory item
 * ************************** */
async function addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) {
  try {
    const sql = `INSERT INTO inventory (
      inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`
    return await pool.query(sql, [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id])
  } catch (error) {
    console.error("addInventory error " + error)
    throw error
  }
}

/* ***************************
 *  Update an existing inventory item
 * ************************** */
async function updateInventory(inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) {
  try {
    const sql = `UPDATE inventory SET inv_make=$2, inv_model=$3, inv_year=$4, inv_description=$5, inv_image=$6, inv_thumbnail=$7, inv_price=$8, inv_miles=$9, inv_color=$10, classification_id=$11 WHERE inv_id=$1 RETURNING *`
    return await pool.query(sql, [inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id])
  } catch (error) {
    console.error("updateInventory error " + error)
    throw error
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1 RETURNING *'
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    console.error('deleteInventoryItem error ' + error)
    throw error
  }
}

// remove duplicate function (kept earlier updateInventory which returns query result)

module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById, getInventoryById, addClassification, addInventory, updateInventory, deleteInventoryItem};