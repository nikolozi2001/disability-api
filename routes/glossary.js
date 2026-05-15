const express = require("express");
const router = express.Router();
const glossaryController = require("../controllers/glossaryController");

router.get("/letters", glossaryController.getGlossaryDistinctLetters);
router.get("/letters/:lang", glossaryController.getGlossaryDistinctLetters);
router.get("/lang/:lang/letter/:letter", glossaryController.getGlossaryByLangAndLetter);
router.get("/lang/:lang", glossaryController.getGlossaryByLang);
router.get("/letter/:letter", glossaryController.getGlossaryByLetter);

module.exports = router;
