import fs from 'fs'
import path from 'path'
import Joi from 'joi'

const configSchema = Joi.object({
	dbType: Joi.string().valid('postgres', 'mysql', 'sqlite').required(),
	host: Joi.string().default('localhost'),
	port: Joi.number().default(5432),
	user: Joi.string().required(),
	password: Joi.string().allow('').required(),
	database: Joi.string().required(),
	outputDir: Joi.string().default('src/db-types'),
	outputFileName: Joi.string().default('schema.d.ts'),
})

export interface Config {
	dbType: 'postgres' | 'mysql' | 'sqlite'
	host?: string
	port?: number
	user: string
	password: string
	database: string
	outputDir: string
	outputFileName: string
}

export function loadConfig(): Config {
	const configPath = path.resolve(process.cwd(), 'typify-db.config.json')
	if (!fs.existsSync(configPath)) {
		throw new Error('Config not found. Run `typify-db init` first.')
	}
	const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
	const { value, error } = configSchema.validate(raw, { convert: true })
	if (error) {
		throw new Error(`Config validation error: ${error.message}`)
	}
	return value
}
