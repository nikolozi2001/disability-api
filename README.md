# Disability API

REST API for accessing disability-related records from the SHSHM Portal database. Built with Node.js, Express, and Microsoft SQL Server.

## Requirements

- Node.js v18+
- Microsoft SQL Server
- npm

## Installation

```bash
npm install
```

Copy the environment file and fill in your database credentials:

```bash
cp .env.example .env
```

## Environment Variables

| Variable      | Description              | Default |
|---------------|--------------------------|---------|
| `DB_SERVER`   | SQL Server hostname/IP   |         |
| `DB_DATABASE` | Database name            |         |
| `DB_USER`     | Database user            |         |
| `DB_PASSWORD` | Database password        |         |
| `DB_PORT`     | SQL Server port          | `1433`  |
| `PORT`        | API server port          | `3001`  |
| `NODE_ENV`    | Environment              | `development` |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins | `http://localhost:3000` |

## Running

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### PM2 (cluster mode)

```bash
pm2 start ecosystem.config.js --env production
```

## API Endpoints

Base URL: `http://localhost:3001`

### Records

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/records` | Get all records (up to 1000) |
| `GET` | `/api/records/:id` | Get a single record by ID |
| `GET` | `/api/records/category/:category` | Filter records by category |
| `GET` | `/api/records/sub_category/:sub_category` | Filter records by sub-category |
| `GET` | `/api/records/:category/:sub_category` | Filter by category and sub-category |

#### Record object

```json
{
  "ID": 1,
  "category": "string",
  "sub_category": "string",
  "title_geo": "string",
  "title_eng": "string",
  "path_geo": "string",
  "path_eng": "string",
  "chartdata": "string"
}
```

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check — DB connectivity, uptime, system info |
| `GET` | `/` | API dashboard (HTML) |
| `GET` | `/api/` | Returns this README as plain text |

#### Health response example

```json
{
  "status": "healthy",
  "timestamp": "2026-05-06T10:00:00.000Z",
  "uptime": { "ms": 60000, "formatted": "1m 0s" },
  "database": { "connected": true, "latency": 3 },
  "system": {
    "nodeVersion": "v20.0.0",
    "platform": "win32",
    "memory": { "used": 45, "total": 16384 }
  }
}
```

## Project Structure

```
disability-api/
├── app.js                   # Entry point, Express setup
├── db.js                    # SQL Server connection pool
├── logger.js                # Winston logger
├── ecosystem.config.js      # PM2 config
├── routes/
│   └── records.js           # Route definitions
├── controllers/
│   └── recordsController.js # Query logic
├── middleware/
│   ├── errorHandler.js      # Global error handler
│   └── validate.js          # Request validation
└── .env.example             # Environment template
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `express` | HTTP framework |
| `mssql` | SQL Server client |
| `helmet` | Security headers |
| `cors` | Cross-origin resource sharing |
| `dotenv-safe` | Environment variable validation |
| `joi` | Input schema validation |
| `express-rate-limit` | Rate limiting |
| `winston` | Logging |
| `nodemon` | Dev auto-reload |
