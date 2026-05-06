const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const recordsController = require("../controllers/recordsController");


router.get("/", (req, res) => {
  const readmePath = path.join(__dirname, "../README.md");
  fs.readFile(readmePath, "utf8", (err, data) => {
    if (err) {
      res.status(500).send("Error reading README.md");
    } else {
      res.type("text/plain").send(data);
    }
  });
});

router.get("/records", recordsController.getAllRecords);
router.get("/records/category/:category", recordsController.getRecordsByCategory);
router.get(
  "/records/sub_category/:sub_category",
  recordsController.getRecordsBySubCategory,
);
router.get(
  "/records/:category/:sub_category",
  recordsController.getRecordsByCategoryAndSubCategory,
);
router.get("/records/:id", recordsController.getRecordById);

module.exports = router;
