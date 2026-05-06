const { sql, poolPromise } = require("../db");
const logger = require("../logger");

const FILES_SELECT_QUERY = `
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

const LANG_FIELDS = {
  ka: "[title_geo], [path_geo]",
  en: "[title_eng], [path_eng]",
};

const buildSelectQuery = (lang) => {
  const fields = LANG_FIELDS[lang];
  if (!fields) return FILES_SELECT_QUERY;
  return `
  SELECT TOP (1000)
    [ID],
    [category],
    [sub_category],
    ${fields},
    [chartdata]
  FROM [shshmportal].[dbo].[files]
`;
};

const isGeorgian = (key) => /[ა-ჿ]/.test(key);

const filterChartdataByLang = (chartdata, lang) => {
  if (!lang || !Array.isArray(chartdata)) return chartdata;

  return chartdata.map((row) =>
    Object.fromEntries(
      Object.entries(row).filter(([key]) => {
        if (key === "year") return true;
        if (lang === "ka") return isGeorgian(key);
        if (lang === "en") return !isGeorgian(key);
        return true;
      })
    )
  );
};

const parseChartdata = (record, lang) => {
  try {
    const parsed = record.chartdata ? JSON.parse(record.chartdata) : null;
    return {
      ...record,
      chartdata: filterChartdataByLang(parsed, lang),
    };
  } catch {
    return record;
  }
};

const getAllRecords = async (req, res) => {
  const query = buildSelectQuery(req.query.lang);
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(query);
    res.json(result.recordset.map((r) => parseChartdata(r, req.query.lang)));
  } catch (err) {
    logger.error(`Error in getAllRecords: ${err.stack}`);
    res.status(500).json({ error: err.message });
  }
};

const getRecordById = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: "ID must be a number." });
  }

  const query = buildSelectQuery(req.query.lang);
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`${query} WHERE [ID] = @id`);

    if (!result.recordset[0]) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json(parseChartdata(result.recordset[0], req.query.lang));
  } catch (err) {
    logger.error(`Error in getRecordById: ${err.stack}`);
    res.status(500).json({ error: err.message });
  }
};

const getRecordsByCategoryAndSubCategory = async (req, res) => {
  const { category, sub_category } = req.params;
  const query = buildSelectQuery(req.query.lang);

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("category", sql.NVarChar, category)
      .input("sub_category", sql.NVarChar, sub_category)
      .query(
        `${query} WHERE [category] = @category AND [sub_category] = @sub_category`,
      );

    res.json(result.recordset.map((r) => parseChartdata(r, req.query.lang)));
  } catch (err) {
    logger.error(`Error in getRecordsByCategoryAndSubCategory: ${err.stack}`);
    res.status(500).json({ error: err.message });
  }
};

const getRecordsByCategory = async (req, res) => {
  const { category } = req.params;
  const query = buildSelectQuery(req.query.lang);

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("category", sql.NVarChar, category)
      .query(`${query} WHERE [category] = @category`);

    res.json(result.recordset.map((r) => parseChartdata(r, req.query.lang)));
  } catch (err) {
    logger.error(`Error in getRecordsByCategory: ${err.stack}`);
    res.status(500).json({ error: err.message });
  }
};

const getRecordsBySubCategory = async (req, res) => {
  const { sub_category } = req.params;
  const query = buildSelectQuery(req.query.lang);

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("sub_category", sql.NVarChar, sub_category)
      .query(`${query} WHERE [sub_category] = @sub_category`);

    res.json(result.recordset.map((r) => parseChartdata(r, req.query.lang)));
  } catch (err) {
    logger.error(`Error in getRecordsBySubCategory: ${err.stack}`);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllRecords,
  getRecordById,
  getRecordsByCategoryAndSubCategory,
  getRecordsByCategory,
  getRecordsBySubCategory,
};
