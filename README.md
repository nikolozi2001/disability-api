# NRG API

## Overview

This API provides endpoints to manage records, households, monthes, resource data, energy consumption, and indicators.

## Prerequisites

- Node.js
- SQL Server

## Setup

1. Clone the repository:

   ```sh
   git clone <repository-url>
   cd nrg-api
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Configure the database connection:
   Update the `.env` file with your SQL Server credentials.

## Running the Server

1. Install dependencies:

   ```sh
   npm install
   ```

2. Start the server:
   ```sh
   npm start
   ```

The server will run on `http://localhost:3000`.

## Endpoints

### Records

- **GET /api/records**: Get top 1000 records from `[shshmportal].[dbo].[files]`.
- **GET /api/records/:id**: Get a record by `ID`.
- **GET /api/records/category/:category**: Get records filtered only by `category`.
- **GET /api/records/sub_category/:sub_category**: Get records filtered only by `sub_category`.
- **GET /api/records/:category/:sub_category**: Get records filtered by both `category` and `sub_category`.

### Households

- **GET /api/households/:id**: Get household data by chart ID.

### Monthes

- **GET /api/monthes/:year/:chart_id**: Get month data by year and chart ID.

### Monthes (All Data)

- **GET /api/monthesAll/year/:year**: Get all months data for a specific year.
- **GET /api/monthesAll/year/:year/chart/:chart_id**: Get months data for a specific year and chart ID.

### Resource

- **GET /api/resource/:year/:chart_id**: Get resource data by year and chart ID.

### Households with Codes

- **GET /api/householdswithcodes/:id**: Get households with codes data by chart ID.

### Energy Consumption

- **GET /api/energyConsumption/:legend_code**: Get energy consumption data by legend code.

### Energy Consumption By Sector

- **GET /api/energyConsumptionBySector/:legend_code**: Get energy consumption data by sector.

### Energy Production Data

- **GET /api/energyProduction/:legend_code**: Get energy Production data by legend code.

### Indicators

- **GET /api/indicators/:name**: Get indicator data by name.

### Coal Supply Consumption (in Terajoules)

- **GET /api/coalSupply/year/:year**: Get all coal supply consumption data for a specific year.
- **GET /api/coalSupply/code/:code/year/:year**: Get coal supply consumption data for a specific code and year.

### Coal Supply Consumption (in Tons)

- **GET /api/coalSupplyTons/year/:year**: Get all coal supply consumption data in tons for a specific year.
- **GET /api/coalSupplyTons/code/:code/year/:year**: Get coal supply consumption data in tons for a specific code and year.

### Coal Supply Consumption (in Tons of Oil)

- **GET /api/coalSupplyTonsOfOil/year/:year**: Get all coal supply consumption data in tons of oil for a specific year.
- **GET /api/coalSupplyTonsOfOil/name/:name/year/:year**: Get coal supply consumption data in tons of oil for a specific name and year.

## Example Requests

### Get All Records

```
GET /api/records
```

### Get Record by Code

```
GET /api/records/1
```

### Get Records by Category

```
GET /api/records/category/health
```

### Get Records by Sub Category

```
GET /api/records/sub_category/statistics
```

### Get Records by Category and Sub Category

```
GET /api/records/health/statistics
```

### Get Household Data by Chart ID

```
GET /api/households/1
```

### Get Month Data by Year and Chart ID

```
GET /api/monthes/2018/1
```

### Get Resource Data by Year and Chart ID

```
GET /api/resource/2018/1
```

### Get Households with Codes Data by Chart ID

```
GET /api/householdswithcodes/1
```

### Get Energy Consumption Data by Legend Code

```
GET /api/energyConsumption/code123
```

### Get Energy Consumption Data by Legend Sector

```
GET /api/getEnergyConsumptionBySector/code123
```

### Get Indicator Data by Name

```
GET /api/indicators/indicator_name
```

### Get Coal Supply Consumption by Year (in Terajoules)

```
GET /api/coalSupply/year/2023
```

### Get Coal Supply Consumption by Code and Year (in Terajoules)

```
GET /api/coalSupply/code/ABC123/year/2023
```

### Get Coal Supply Consumption by Year (in Tons)

```
GET /api/coalSupplyTons/year/2023
```

### Get Coal Supply Consumption by Code and Year (in Tons)

```
GET /api/coalSupplyTons/code/ABC123/year/2023
```

### Get Coal Supply Consumption in Tons of Oil by Year

```
GET /api/coalSupplyTonsOfOil/year/2023
```

### Get Coal Supply Consumption in Tons of Oil by Name and Year

```
GET /api/coalSupplyTonsOfOil/name/ABC123/year/2023
```

## Error Handling

If an error occurs, the API will return a JSON response with an error message and a status code of 500.

```json
{
  "error": "Error message"
}
```

## Project Structure

```
nrg-api/
├── controllers/
│   └── recordsController.js
│   └── householdsController.js
│   └── monthesController.js
│   └── resourceController.js
│   └── households_with_codesController.js
│   └── energyConsumptionController.js
│   └── energyConsumptionBySectorController.js
│   └── energyProductionController.js
│   └── indicatorsController.js
│   └── coalSupplyController.js
│   └── coalSupplyTonsController.js
├── middleware/
│   └── errorHandler.js
│   └── validate.js
├── routes/
│   └── records.js
├── db.js
├── logger.js
├── app.js
├── .env
├── .env.example
└── README.md
```
