import { Client as PgClient } from 'pg'
import mysql, { Connection as MySqlConnection } from 'mysql2/promise'
import sqlite3 from 'sqlite3'
import { Config } from '../config'

/**
 * Returns a connected client for the specified database.
 * @throws {Error} if cfg.dbType is unsupported or connection fails.
 */
export async function createClient(
	cfg: Config
): Promise<PgClient | MySqlConnection | sqlite3.Database> {
	switch (cfg.dbType) {
		case 'postgres': {
			const client = new PgClient({
				host: cfg.host,
				port: Number(cfg.port),
				user: cfg.user,
				password: cfg.password,
				database: cfg.database,
				// you can also add ssl, connectionTimeoutMillis, etc. here
			})
			await client.connect()
			return client
		}

		case 'mysql': {
			const connection = await mysql.createConnection({
				host: cfg.host,
				port: Number(cfg.port),
				user: cfg.user,
				password: cfg.password,
				database: cfg.database,
				// you can also add ssl, timezone, charset, etc. here
			})
			return connection
		}

		case 'sqlite': {
			// sqlite3 is callback-based, so we wrap it in a Promise for consistency
			return new Promise<sqlite3.Database>((resolve, reject) => {
				const db = new sqlite3.Database(
					cfg.database, // this should be the file path, e.g. './data.db' or ':memory:'
					sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
					(err) => {
						if (err) return reject(err)
						resolve(db)
					}
				)
			})
		}

		default:
			throw new Error(`Unsupported database type: ${cfg.dbType}`)
	}
}
