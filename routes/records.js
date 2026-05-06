const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const recordsController = require("../controllers/recordsController");

router.get("/", async (req, res) => {
  try {
    const readmePath = path.join(__dirname, "../README.md");
    const data = await fs.promises.readFile(readmePath, "utf8");
    res.type("text/plain").send(data);
  } catch (err) {
    res.status(500).send("Error reading README.md");
  }
});

router.get("/records", recordsController.getAllRecords);
router.get("/records/category/:category", recordsController.getRecordsByCategory);
router.get("/records/sub_category/:sub_category", recordsController.getRecordsBySubCategory);
router.get("/records/:category/:sub_category", recordsController.getRecordsByCategoryAndSubCategory);
router.get("/records/:id", recordsController.getRecordById);

module.exports = router;
