const { sql, poolPromise } = require("../db");
const logger = require("../logger");

const GLOSSARY_SELECT_QUERY = `
  SELECT TOP (1000)
    [ID],
    [lang],
    [letter],
    [text]
  FROM [shshmportal].[dbo].[glossary]
`;

const SUPPORTED_GLOSSARY_LANGUAGES = ["ka", "en"];

const LANGUAGE_ALPHABETS = {
  ka: [
    "ა", "ბ", "გ", "დ", "ე", "ვ", "ზ", "თ", "ი", "კ", "ლ", "მ", "ნ", "ო", "პ", "ჟ", "რ", "ს", "ტ", "უ", "ფ", "ქ", "ღ", "ყ", "შ", "ჩ", "ც", "ძ", "წ", "ჭ", "ხ", "ჯ", "ჰ",
  ],
  en: "abcdefghijklmnopqrstuvwxyz".split(""),
};

const getGlossaryByLangAndLetter = async (req, res) => {
  const { lang, letter } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("lang", sql.NVarChar, lang)
      .input("letter", sql.NVarChar, letter)
      .query(`${GLOSSARY_SELECT_QUERY} WHERE [lang] = @lang AND [letter] = @letter`);

    res.json(result.recordset);
  } catch (err) {
    logger.error(`Error in getGlossaryByLangAndLetter: ${err.stack}`);
    res.status(500).json({ error: err.message });
  }
};

const getGlossaryByLang = async (req, res) => {
  const { lang } = req.params;
  const normalizedLang = String(lang).toLowerCase();

  if (!SUPPORTED_GLOSSARY_LANGUAGES.includes(normalizedLang)) {
    return res.status(400).json({
      error: "Invalid language. Supported values are 'ka' and 'en'.",
    });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("lang", sql.NVarChar, normalizedLang)
      .query(`${GLOSSARY_SELECT_QUERY} WHERE [lang] = @lang`);

    const recordsByLetter = new Map();
    result.recordset.forEach((row) => {
      const letterKey = row.letter;
      if (!recordsByLetter.has(letterKey)) {
        recordsByLetter.set(letterKey, []);
      }
      recordsByLetter.get(letterKey).push(row);
    });

    const completeRecordset = [];
    LANGUAGE_ALPHABETS[normalizedLang].forEach((letter) => {
      const records = recordsByLetter.get(letter);
      if (records && records.length > 0) {
        completeRecordset.push(...records);
      } else {
        completeRecordset.push({
          ID: null,
          lang: normalizedLang,
          letter,
          text: "",
        });
      }
    });

    return res.json(completeRecordset);
  } catch (err) {
    logger.error(`Error in getGlossaryByLang: ${err.stack}`);
    return res.status(500).json({ error: err.message });
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

const getGlossaryDistinctLetters = async (req, res) => {
  const requestedLang = req.params.lang || req.query.lang;
  const normalizedLang = requestedLang ? String(requestedLang).toLowerCase() : null;

  if (normalizedLang && !SUPPORTED_GLOSSARY_LANGUAGES.includes(normalizedLang)) {
    return res.status(400).json({
      error: "Invalid language. Supported values are 'ka' and 'en'.",
    });
  }

  try {
    const pool = await poolPromise;

    if (normalizedLang) {
      const result = await pool
        .request()
        .input("lang", sql.NVarChar, normalizedLang)
        .query(`
          SELECT DISTINCT [letter]
          FROM [shshmportal].[dbo].[glossary]
          WHERE [lang] = @lang
          ORDER BY [letter]
        `);

      return res.json({
        lang: normalizedLang,
        letters: result.recordset.map((row) => row.letter),
      });
    }

    const result = await pool
      .request()
      .query(`
        SELECT [lang], [letter]
        FROM (
          SELECT DISTINCT [lang], [letter]
          FROM [shshmportal].[dbo].[glossary]
          WHERE [lang] IN ('ka', 'en')
        ) AS distinct_letters
        ORDER BY [lang], [letter]
      `);

    const groupedLetters = { ka: [], en: [] };
    result.recordset.forEach((row) => {
      if (groupedLetters[row.lang]) {
        groupedLetters[row.lang].push(row.letter);
      }
    });

    return res.json(groupedLetters);
  } catch (err) {
    logger.error(`Error in getGlossaryDistinctLetters: ${err.stack}`);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getGlossaryByLangAndLetter,
  getGlossaryByLang,
  getGlossaryByLetter,
  getGlossaryDistinctLetters,
};
