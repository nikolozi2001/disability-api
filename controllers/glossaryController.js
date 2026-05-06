const { sql, poolPromise } = require("../db");
const logger = require("../logger");

const GLOSSARY_SELECT_QUERY = `
  SELECT TOP (1000)
    [ID],
    [category],
    [sub_category],
    [title_geo],
    [title_eng],
    [path_geo],
    [path_eng],
    [chartdata]
  FROM [shshmportal].[dbo].[files]
`;

const getGlossaryByLangAndLetter = async (req, res) => {
  const { lang, letter } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("lang", sql.NVarChar, lang)
      .input("letter", sql.NVarChar, letter)
      .query(
        `${GLOSSARY_SELECT_QUERY} WHERE [lang] = @lang AND [letter] = @letter`,
      );

    res.json(result.recordset);
  } catch (err) {
    logger.error(`Error in getGlossaryByLangAndLetter: ${err.stack}`);
    res.status(500).json({ error: err.message });
  }
};

const getGlossaryByLang = async (req, res) => {
  const { lang } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("lang", sql.NVarChar, lang)
      .query(`${GLOSSARY_SELECT_QUERY} WHERE [lang] = @lang`);

    res.json(result.recordset);
  } catch (err) {
    logger.error(`Error in getGlossaryByLang: ${err.stack}`);
    res.status(500).json({ error: err.message });
  }
};

const getGlossaryByLetter = async (req, res) => {
  const { letter } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("letter", sql.NVarChar, letter)
      .query(`${GLOSSARY_SELECT_QUERY} WHERE [letter] = @letter`);

    res.json(result.recordset);
  } catch (err) {
    logger.error(`Error in getGlossaryByLetter: ${err.stack}`);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getGlossaryByLangAndLetter,
  getGlossaryByLang,
  getGlossaryByLetter,
};
