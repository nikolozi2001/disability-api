const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const os = require("os");
const errorHandler = require("./middleware/errorHandler");
const { poolPromise } = require("./db");
require("dotenv").config();

const app = express();
const recordsRoutes = require("./routes/records");

// Track server start time for uptime calculation
const serverStartTime = Date.now();

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", "https://energy-api.geostat.ge", "http://localhost:3000"], 
        imgSrc: ["'self'", "data:"],
      },
    },
  }),
);

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());

// Health check endpoint
app.get("/health", async (req, res) => {
  let dbStatus = { connected: false, latency: null };

  try {
    const pool = await poolPromise;
    const start = Date.now();
    await pool.request().query("SELECT 1");
    dbStatus = { connected: true, latency: Date.now() - start };
  } catch (err) {
    dbStatus = { connected: false, error: err.message };
  }

  const uptime = Date.now() - serverStartTime;

  res.json({
    status: dbStatus.connected ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: {
      ms: uptime,
      formatted: formatUptime(uptime),
    },
    database: dbStatus,
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(os.totalmem() / 1024 / 1024),
      },
    },
  });
});

// Root dashboard
app.get("/", async (req, res) => {
  let dbConnected = false;
  try {
    const pool = await poolPromise;
    await pool.request().query("SELECT 1");
    dbConnected = true;
  } catch (err) {
    dbConnected = false;
  }

  const uptime = formatUptime(Date.now() - serverStartTime);
  const nodeVersion = process.version;
  const env = process.env.NODE_ENV || "development";
  const dbStatusClass = dbConnected ? "status-online" : "status-offline";
  const dbStatusText = dbConnected ? "Connected" : "Disconnected";
  const currentYear = new Date().getFullYear();

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NRG API - Documentation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      color: #fff;
      line-height: 1.6;
    }
    .header {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(10px);
      padding: 20px 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .header-left { display: flex; align-items: center; gap: 16px; }
    .header h1 { font-size: 24px; font-weight: 600; }
    .version {
      background: linear-gradient(135deg, #667eea, #764ba2);
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .status-card {
      background: rgba(255,255,255,0.05);
      border-radius: 16px;
      padding: 24px;
      border: 1px solid rgba(255,255,255,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .status-card:hover { transform: translateY(-4px); box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
    .status-card .label { color: #888; font-size: 14px; margin-bottom: 8px; }
    .status-card .value { font-size: 24px; font-weight: 600; }
    .status-card .icon { font-size: 28px; margin-bottom: 12px; }
    .status-online { color: #4caf50; }
    .status-offline { color: #f44336; }
    .section { margin-bottom: 40px; }
    .section-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .section-title::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.1); }
    .category {
      background: rgba(255,255,255,0.03);
      border-radius: 16px;
      margin-bottom: 20px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .category-header {
      background: rgba(255,255,255,0.05);
      padding: 16px 24px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .category-icon { font-size: 20px; }
    .category-count {
      margin-left: auto;
      background: rgba(255,255,255,0.1);
      padding: 2px 10px;
      border-radius: 10px;
      font-size: 12px;
    }
    .endpoints { padding: 8px; }
    .endpoint {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      border-radius: 8px;
      transition: background 0.2s;
    }
    .endpoint:hover { background: rgba(255,255,255,0.05); }
    .method {
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 4px;
      min-width: 50px;
      text-align: center;
    }
    .method-get { background: #4caf50; color: #fff; }
    .endpoint-path { font-family: 'Monaco', 'Consolas', monospace; color: #e0e0e0; font-size: 14px; }
    .endpoint-path .param { color: #ff9800; }
    .endpoint-desc { color: #888; font-size: 13px; margin-left: auto; }
    footer { text-align: center; padding: 40px; color: #666; border-top: 1px solid rgba(255,255,255,0.1); }
    footer a { color: #667eea; text-decoration: none; }
    footer a:hover { text-decoration: underline; }
    @media (max-width: 768px) {
      .header { padding: 16px 20px; flex-wrap: wrap; gap: 12px; }
      .endpoint { flex-wrap: wrap; }
      .endpoint-desc { margin-left: 66px; margin-top: 4px; width: 100%; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <span style="font-size:32px">⚡</span>
      <h1>NRG API</h1>
    </div>
    <span class="version">v1.0.0</span>
  </div>

  <div class="container">
    <div class="status-grid">
      <div class="status-card">
        <div class="icon">⚡</div>
        <div class="label">API Status</div>
        <div class="value status-online">Online</div>
      </div>
      <div class="status-card">
        <div class="icon">🗄️</div>
        <div class="label">Database</div>
        <div class="value ${dbStatusClass}">${dbStatusText}</div>
      </div>
      <div class="status-card">
        <div class="icon">⏱️</div>
        <div class="label">Uptime</div>
        <div class="value">${uptime}</div>
      </div>
      <div class="status-card">
        <div class="icon">🔧</div>
        <div class="label">Environment</div>
        <div class="value">${env}</div>
      </div>
      <div class="status-card">
        <div class="icon">📦</div>
        <div class="label">Node.js</div>
        <div class="value">${nodeVersion}</div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">📚 API Endpoints</h2>

      <div class="category">
        <div class="category-header">
          <span class="category-icon">📋</span>
          <span>Records</span>
          <span class="category-count">2 endpoints</span>
        </div>
        <div class="endpoints">
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/records</span>
            <span class="endpoint-desc">Get all records</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/records/<span class="param">:id</span></span>
            <span class="endpoint-desc">Get record by ID</span>
          </div>
        </div>
      </div>

      <div class="category">
        <div class="category-header">
          <span class="category-icon">🏠</span>
          <span>Households</span>
          <span class="category-count">2 endpoints</span>
        </div>
        <div class="endpoints">
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/households/<span class="param">:id</span></span>
            <span class="endpoint-desc">Get household data by chart ID</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/householdswithcodes/<span class="param">:id</span></span>
            <span class="endpoint-desc">Get households with codes by chart ID</span>
          </div>
        </div>
      </div>

      <div class="category">
        <div class="category-header">
          <span class="category-icon">📦</span>
          <span>Resources with Codes</span>
          <span class="category-count">3 endpoints</span>
        </div>
        <div class="endpoints">
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/resourceswithcodes/years</span>
            <span class="endpoint-desc">Get all available years</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/resourceswithcodes/<span class="param">:id</span></span>
            <span class="endpoint-desc">Get resources with codes by chart ID</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/resource/<span class="param">:year</span>/<span class="param">:chart_id</span></span>
            <span class="endpoint-desc">Get resource data by year and chart ID</span>
          </div>
        </div>
      </div>

      <div class="category">
        <div class="category-header">
          <span class="category-icon">⚡</span>
          <span>Energy</span>
          <span class="category-count">3 endpoints</span>
        </div>
        <div class="endpoints">
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/energyConsumption/<span class="param">:legend_code</span></span>
            <span class="endpoint-desc">Get energy consumption by legend code</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/energyConsumptionBySector/<span class="param">:legend_code</span></span>
            <span class="endpoint-desc">Get energy consumption by sector and legend code</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/energyProduction/<span class="param">:legend_code</span></span>
            <span class="endpoint-desc">Get energy production by legend code</span>
          </div>
        </div>
      </div>

      <div class="category">
        <div class="category-header">
          <span class="category-icon">🪨</span>
          <span>Coal Supply</span>
          <span class="category-count">6 endpoints</span>
        </div>
        <div class="endpoints">
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/coalSupply/year/<span class="param">:year</span></span>
            <span class="endpoint-desc">Get coal supply by year</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/coalSupply/code/<span class="param">:code</span>/year/<span class="param">:year</span></span>
            <span class="endpoint-desc">Get coal supply by code and year</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/coalSupplyTons/year/<span class="param">:year</span></span>
            <span class="endpoint-desc">Get coal supply in tons by year</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/coalSupplyTons/code/<span class="param">:code</span>/year/<span class="param">:year</span></span>
            <span class="endpoint-desc">Get coal supply in tons by code and year</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/coalSupplyTonsOfOil/year/<span class="param">:year</span></span>
            <span class="endpoint-desc">Get coal supply (tons of oil equivalent) by year</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/coalSupplyTonsOfOil/code/<span class="param">:code</span>/year/<span class="param">:year</span></span>
            <span class="endpoint-desc">Get coal supply (tons of oil equivalent) by code and year</span>
          </div>
        </div>
      </div>

      <div class="category">
        <div class="category-header">
          <span class="category-icon">🗓️</span>
          <span>Months</span>
          <span class="category-count">4 endpoints</span>
        </div>
        <div class="endpoints">
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/monthes/<span class="param">:year</span>/<span class="param">:chart_id</span></span>
            <span class="endpoint-desc">Get monthly data by year and chart ID</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/monthesAll/year/<span class="param">:year</span></span>
            <span class="endpoint-desc">Get all monthly data by year</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/monthesAll/year/<span class="param">:year</span>/chart/<span class="param">:chart_id</span></span>
            <span class="endpoint-desc">Get monthly data by year and chart ID</span>
          </div>
        </div>
      </div>

      <div class="category">
        <div class="category-header">
          <span class="category-icon">💰</span>
          <span>Pricing</span>
          <span class="category-count">2 endpoints</span>
        </div>
        <div class="endpoints">
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/gasPriceGel/<span class="param">:household</span></span>
            <span class="endpoint-desc">Get gas price in GEL by household type</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/electricityPriceGel/<span class="param">:household</span></span>
            <span class="endpoint-desc">Get electricity price in GEL by household type</span>
          </div>
        </div>
      </div>

      <div class="category">
        <div class="category-header">
          <span class="category-icon">🏭</span>
          <span>Objects</span>
          <span class="category-count">3 endpoints</span>
        </div>
        <div class="endpoints">
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/objects/<span class="param">:code</span></span>
            <span class="endpoint-desc">Get object by code</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/objects/year/<span class="param">:year</span></span>
            <span class="endpoint-desc">Get all objects by year</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/objects/year/<span class="param">:year</span>/sub_code/<span class="param">:sub_code</span></span>
            <span class="endpoint-desc">Get objects by year and sub-code</span>
          </div>
        </div>
      </div>

      <div class="category">
        <div class="category-header">
          <span class="category-icon">🌿</span>
          <span>Biofuel</span>
          <span class="category-count">3 endpoints</span>
        </div>
        <div class="endpoints">
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/biofuel/<span class="param">:code</span></span>
            <span class="endpoint-desc">Get biofuel data by code</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/biofuel/year/<span class="param">:year</span></span>
            <span class="endpoint-desc">Get all biofuel data by year</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/biofuel/year/<span class="param">:year</span>/sub_code/<span class="param">:sub_code</span></span>
            <span class="endpoint-desc">Get biofuel data by year and sub-code</span>
          </div>
        </div>
      </div>

      <div class="category">
        <div class="category-header">
          <span class="category-icon">🔀</span>
          <span>Sankey</span>
          <span class="category-count">3 endpoints</span>
        </div>
        <div class="endpoints">
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/sankey/chart_id/<span class="param">:chart_id</span></span>
            <span class="endpoint-desc">Get Sankey data by chart ID</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/sankey/year/<span class="param">:year</span></span>
            <span class="endpoint-desc">Get all Sankey data by year</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/sankey/year/<span class="param">:year</span>/chart_id/<span class="param">:chart_id</span></span>
            <span class="endpoint-desc">Get Sankey data by year and chart ID</span>
          </div>
        </div>
      </div>

      <div class="category">
        <div class="category-header">
          <span class="category-icon">🛢️</span>
          <span>Oil</span>
          <span class="category-count">3 endpoints</span>
        </div>
        <div class="endpoints">
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/oil/<span class="param">:code</span></span>
            <span class="endpoint-desc">Get oil data by code</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/oil/year/<span class="param">:year</span></span>
            <span class="endpoint-desc">Get all oil data by year</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/oil/year/<span class="param">:year</span>/sub_code/<span class="param">:sub_code</span></span>
            <span class="endpoint-desc">Get oil data by year and sub-code</span>
          </div>
        </div>
      </div>

      <div class="category">
        <div class="category-header">
          <span class="category-icon">💡</span>
          <span>Electricity &amp; Heat</span>
          <span class="category-count">3 endpoints</span>
        </div>
        <div class="endpoints">
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/electricityHeat/<span class="param">:code</span></span>
            <span class="endpoint-desc">Get electricity/heat data by code</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/electricityHeat/year/<span class="param">:year</span></span>
            <span class="endpoint-desc">Get all electricity/heat data by year</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/electricityHeat/year/<span class="param">:year</span>/sub_code/<span class="param">:sub_code</span></span>
            <span class="endpoint-desc">Get electricity/heat data by year and sub-code</span>
          </div>
        </div>
      </div>

      <div class="category">
        <div class="category-header">
          <span class="category-icon">🔥</span>
          <span>Natural Gas</span>
          <span class="category-count">3 endpoints</span>
        </div>
        <div class="endpoints">
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/naturalGas/<span class="param">:code</span></span>
            <span class="endpoint-desc">Get natural gas data by code</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/naturalGas/year/<span class="param">:year</span></span>
            <span class="endpoint-desc">Get all natural gas data by year</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/naturalGas/year/<span class="param">:year</span>/sub_code/<span class="param">:sub_code</span></span>
            <span class="endpoint-desc">Get natural gas data by year and sub-code</span>
          </div>
        </div>
      </div>

      <div class="category">
        <div class="category-header">
          <span class="category-icon">📊</span>
          <span>Main NRG Indicators</span>
          <span class="category-count">2 endpoints</span>
        </div>
        <div class="endpoints">
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/mainNrgIndicators/<span class="param">:chartid</span></span>
            <span class="endpoint-desc">Get main NRG indicators by chart ID</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/api/indicators/<span class="param">:name</span></span>
            <span class="endpoint-desc">Get indicators by name</span>
          </div>
        </div>
      </div>

      <div class="category">
        <div class="category-header">
          <span class="category-icon">⚙️</span>
          <span>System</span>
          <span class="category-count">1 endpoint</span>
        </div>
        <div class="endpoints">
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="endpoint-path">/health</span>
            <span class="endpoint-desc">API health check with DB status &amp; metrics</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <footer>
    <p>&copy; ${currentYear} NRG API &middot; Built with Express.js</p>
    <p style="margin-top: 8px;">
      <a href="https://github.com/nikolozi2001/nrg-api" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
    </p>
  </footer>
</body>
</html>`);
});

app.use("/api", recordsRoutes);
app.use(errorHandler);

// Error handling for uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  process.exit(1);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});