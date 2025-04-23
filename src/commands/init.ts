import { Command } from 'commander'
import inquirer, { Question } from 'inquirer'
import fs from 'fs'
import path from 'path'
import { Config } from '../config'

interface InitConfig {
	dbType: 'postgres' | 'mysql' | 'sqlite'
	host: string
	port: string
	user: string
	password: string
	database: string
	outputDir: string
	outputFileName: string
}

const questions: Question<InitConfig>[] = [
	{
		name: 'dbType',
		type: 'select',
		message: 'Database type',
		choices: ['postgres', 'mysql', 'sqlite'],
	},
	{
		name: 'host',
		type: 'text',
		message: 'Host',
		default: 'localhost',
	},
	{
		name: 'port',
		type: 'text',
		message: 'Port',
		default: (answers: InitConfig) =>
			answers.dbType === 'postgres' ? '5432' : '3306',
	},
	{
		name: 'user',
		type: 'text',
		message: 'Username',
		default: 'root',
	},
	{
		name: 'password',
		type: 'password',
		message: 'Password',
	},
	{
		name: 'database',
		type: 'text',
		message: 'Database name',
	},
	{
		name: 'outputDir',
		type: 'text',
		message: 'Where to write types',
		default: 'src/db-types',
	},
	{
		name: 'outputFileName',
		type: 'text',
		message: 'Output file name',
		default: 'schema.d.ts',
	},
	{
		name: 'overwrite',
		type: 'confirm',
		message: 'Overwrite existing config?',
		default: false,
		when: () => fs.existsSync('typify-db.config.json'),
	},
]

export const initCommand = new Command('init')
	.description('Create a typify-db.config.json')
	.action(async () => {
		try {
			//@ts-ignore
			const answers = await inquirer.prompt<Config>(questions)
			const outPath = path.resolve(
				process.cwd(),
				'typify-db.config.json'
			)
			fs.writeFileSync(outPath, JSON.stringify(answers, null, 2))
			console.log(`✔️  Config written to ${outPath}`)
		} catch (err: any) {
			console.error('❌  Init failed:', err.message)
			process.exit(1)
		}
	})
