[![npm version](https://img.shields.io/npm/v/typify-db)](https://www.npmjs.com/package/typify-db)
[![License](https://img.shields.io/npm/l/typify-db.svg)](LICENSE)

Generate TypeScript interfaces from your database schema (PostgreSQL, MySQL, or SQLite) with a simple CLI.

## Features

-    Introspects tables & columns from PostgreSQL, MySQL, or SQLite
-    Outputs a single `schema.d.ts` file containing all interfaces
-    Converts snake_case or CamelCase table names into PascalCase types
-    Configurable via a JSON file
-    Easy to integrate into CI/CD or build scripts

## Installation

Install globally:

```bash
npm install -g typify-db
```

Or as a dev dependency:

```bash
npm install --save-dev typify-db
```

## Configuration

Execute the command:

```bash
npx typify-db init
```

This will create a `typify-db.config.json` file in your project root:

This file will look like this:

```json
{
	"dbType": "postgres",
	"host": "localhost",
	"port": "5432",
	"user": "username",
	"password": "password",
	"database": "mydb",
	"outputDir": "./types"
}
```

-    **dbType**: `postgres` | `mysql` | `sqlite`
-    **host**: database host (ignored for SQLite)
-    **port**: database port (ignored for SQLite)
-    **user**: database user (ignored for SQLite)
-    **password**: database password (ignored for SQLite)
-    **database**: database name or file path for SQLite
-    **outputDir**: directory where `schema.d.ts` will be generated
-    **outputFileName**: an optional file name where the types will be written

## Usage

Simply run:

```bash
npx typify-db generate
```

By default, it looks for `typify-db.config.json` in your current directory and writes `schema.d.ts` to the configured `outputDir`.

## Development

Clone the repo and install dependencies:

```bash
git clone https://github.com/marcos-padilla/typify-db.git
cd typify-db
npm install
```

Build and link locally:

```bash
npm run build
npm link
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
