// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require('../utilities/inv-validation')

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory detail view
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildVehicleDetail));

// Route to build inventory edit view
router.get('/edit/:inv_id', utilities.checkAccountType(['Employee','Admin']), utilities.handleErrors(invController.editInventoryView));

// Route to build delete confirmation view
router.get('/delete/:inv_id', utilities.checkAccountType(['Employee','Admin']), utilities.handleErrors(invController.buildDeleteInventory));

// Process delete request
router.post('/delete', utilities.checkAccountType(['Employee','Admin']), utilities.handleErrors(invController.deleteInventory));

// Management view
router.get("/", utilities.checkAccountType(['Employee','Admin']), utilities.handleErrors(invController.buildManagement));

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Add classification
router.get('/add-classification', utilities.checkAccountType(['Employee','Admin']), utilities.handleErrors(invController.buildAddClassification))
router.post('/add-classification', utilities.checkAccountType(['Employee','Admin']), invValidate.classificationRules(), invValidate.checkClassification, utilities.handleErrors(invController.addClassification))

// Add inventory
router.get('/add-inventory', utilities.checkAccountType(['Employee','Admin']), utilities.handleErrors(invController.buildAddInventory))
router.post('/add-inventory', utilities.checkAccountType(['Employee','Admin']), invValidate.inventoryRules(), invValidate.checkInventory, utilities.handleErrors(invController.addInventory))

// Update inventory
router.post('/update', utilities.checkAccountType(['Employee','Admin']), invValidate.newInventoryRules(), invValidate.checkUpdateData, utilities.handleErrors(invController.updateInventory))

module.exports = router;