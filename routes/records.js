const express = require("express");
const router = express.Router();
const recordsController = require("../controllers/recordsController");

router.get("/records", recordsController.getAllRecords);
router.get("/records/category/:category", recordsController.getRecordsByCategory);
router.get("/records/sub_category/:sub_category", recordsController.getRecordsBySubCategory);
router.get("/records/:category/:sub_category", recordsController.getRecordsByCategoryAndSubCategory);
router.get("/records/:id", recordsController.getRecordById);

module.exports = router;
