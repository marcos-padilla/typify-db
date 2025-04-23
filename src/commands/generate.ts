import { Command } from 'commander'
import fs from 'fs'
import mysql from 'mysql2/promise'
import path from 'path'
import { Client as PgClient } from 'pg'
import sqlite3 from 'sqlite3'
import { loadConfig } from '../config'
import { createClient } from '../db/client'
import { introspectSchema } from '../db/introspect'

async function closeClient(
	client: PgClient | mysql.Connection | sqlite3.Database
): Promise<void> {
	if ('end' in client) {
		// PgClient and mysql2 Connection both have `end(): Promise<void>`
		await client.end()
	} else {
		// sqlite3.Database only has close(cb)
		await new Promise<void>((resolve, reject) => {
			client.close((err) => (err ? reject(err) : resolve()))
		})
	}
}

export const generateCommand = new Command('generate')
	.description('Generate TypeScript types from the database schema')
	.action(async () => {
		try {
			const config = loadConfig()
			const client = await createClient(config)
			const schemas = await introspectSchema(client, config)

			fs.mkdirSync(config.outputDir, { recursive: true })
			// --- all in one file: schema.d.ts ---
			const outFile = path.join(
				config.outputDir,
				config.outputFileName
			)
			const header = [
				`/**`,
				` * Auto-generated types from your database schema.`,
				` * Do not edit manually.`,
				` */`,
				``,
			].join('\n')

			const body = schemas.map((tbl) => tbl.toTypeFile()).join('\n')
			fs.writeFileSync(outFile, header + body)
			console.log(
				`✔️  Generated ${schemas.length} types in ${outFile}`
			)
			await closeClient(client)
		} catch (err: any) {
			console.error('❌  Generation failed:', err.message)
			process.exit(1)
		}
	})
