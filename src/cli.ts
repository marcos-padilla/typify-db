#!/usr/bin/env node

import { Command } from 'commander'
import { initCommand } from './commands/init'
import { generateCommand } from './commands/generate'

export const program = new Command()

program
	.name('typify-db')
	.description('Generate TypeScript types from your database schema')
	.version('0.1.0')

program.addCommand(initCommand)
program.addCommand(generateCommand)

program.parse(process.argv)
