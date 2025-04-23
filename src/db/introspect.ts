import { Connection as MySqlConnection, RowDataPacket } from 'mysql2/promise'
import { Client as PgClient, QueryResult } from 'pg'
import sqlite3 from 'sqlite3'
import { Config } from '../config'
import { mapSqlTypeToTs, toPascalSingularCase } from '../utils'

import { TableSchema } from '../types'

export async function introspectSchema(
	client: PgClient | MySqlConnection | sqlite3.Database,
	cfg: Config
): Promise<TableSchema[]> {
	// 1. fetch all tables
	let tableRows: { table_name: string }[]

	if (cfg.dbType === 'postgres') {
		// pg returns an object, not an array
		const pgRes: QueryResult<{ table_name: string }> = await (
			client as PgClient
		).query(
			`SELECT table_name
           FROM information_schema.tables
          WHERE table_type = 'BASE TABLE'
            AND table_schema = 'public'`
		)
		tableRows = pgRes.rows
	} else if (cfg.dbType === 'mysql') {
		// mysql2/promise returns [rows, fields]
		const [mysqlRows] = await (client as MySqlConnection).query<
			RowDataPacket[]
		>(
			`SELECT table_name
         FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'`
		)
		// cast to your shape
		tableRows = mysqlRows as { table_name: string }[]
	} else {
		// sqlite3 is callback-based
		tableRows = await new Promise<{ table_name: string }[]>(
			(resolve, reject) => {
				;(client as sqlite3.Database).all(
					`SELECT name AS table_name
				FROM sqlite_master
			    WHERE type = 'table'`,
					(err, rows) => {
						if (err) return reject(err)
						// <-- assert that each row really has the shape we expect
						resolve(rows as { table_name: string }[])
					}
				)
			}
		)
	}

	const schemas: TableSchema[] = []

	// 2. for each table, fetch its columns and build a schema
	for (const { table_name } of tableRows) {
		let colRows: any[]

		if (cfg.dbType === 'postgres') {
			const pgCols: QueryResult<{
				column_name: string
				data_type: string
			}> = await (client as PgClient).query(
				`SELECT column_name, data_type
           FROM information_schema.columns
          WHERE table_name = $1`,
				[table_name]
			)
			colRows = pgCols.rows
		} else if (cfg.dbType === 'mysql') {
			const [mysqlCols] = await (client as MySqlConnection).query<
				RowDataPacket[]
			>(
				`SELECT column_name, data_type
           FROM information_schema.columns
          WHERE table_name = ?`,
				[table_name]
			)
			colRows = mysqlCols as {
				column_name: string
				data_type: string
			}[]
		} else {
			colRows = await new Promise<any[]>((resolve, reject) => {
				;(client as sqlite3.Database).all(
					`PRAGMA table_info('${table_name}')`,
					(err, rows) => {
						if (err) reject(err)
						else resolve(rows)
					}
				)
			})
		}

		// build your TableSchema
		schemas.push({
			name: table_name,
			toTypeFile() {
				const lines: string[] = []
				lines.push(`/** Types for table \`${table_name}\` */`)
				lines.push(
					`export interface ${toPascalSingularCase(
						table_name
					)} {`
				)

				for (const col of colRows) {
					const colName =
						cfg.dbType === 'sqlite'
							? col.name
							: col.column_name
					const sqlType =
						cfg.dbType === 'sqlite' ? col.type : col.data_type
					const tsType = mapSqlTypeToTs(sqlType)
					lines.push(`  ${colName}: ${tsType};`)
				}

				lines.push(`}`)
				return lines.join('\n') + '\n'
			},
		})
	}

	return schemas
}
