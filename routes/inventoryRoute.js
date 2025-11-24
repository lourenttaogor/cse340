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

// Management view
router.get("/", utilities.handleErrors(invController.buildManagement));

// Add classification
router.get('/add-classification', utilities.handleErrors(invController.buildAddClassification))
router.post('/add-classification', invValidate.classificationRules(), invValidate.checkClassification, utilities.handleErrors(invController.addClassification))

// Add inventory
router.get('/add-inventory', utilities.handleErrors(invController.buildAddInventory))
router.post('/add-inventory', invValidate.inventoryRules(), invValidate.checkInventory, utilities.handleErrors(invController.addInventory))

module.exports = router;