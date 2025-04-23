// src/db/types.ts

/**
 * A description of one table, with
 *  - `name`: the table’s name, used for filenames
 *  - `toTypeFile()`: renders the TS interface content
 */
export interface TableSchema {
	/** The raw table name from the database */
	name: string

	/**
	 * Return the full text of a `.d.ts` file for this table,
	 * e.g. starting with “export interface User { … }”
	 */
	toTypeFile(): string
}
