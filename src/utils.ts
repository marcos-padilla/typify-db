import pluralize from 'pluralize'

/**
 * Convert a SQL type (postgres/mysql/sqlite) into a TS type.
 */
export function mapSqlTypeToTs(sqlType: string): string {
	const t = sqlType.toLowerCase()

	if (t.includes('int')) {
		return 'number'
	}
	if (
		t.includes('double') ||
		t.includes('decimal') ||
		t.includes('numeric') ||
		t.includes('float')
	) {
		return 'number'
	}
	if (
		t.includes('char') ||
		t.includes('clob') ||
		t.includes('text') ||
		t.includes('uuid')
	) {
		return 'string'
	}
	if (t.includes('date') || t.includes('time') || t.includes('timestamp')) {
		return 'string'
	}
	if (t.includes('bool')) {
		return 'boolean'
	}
	if (t.includes('json')) {
		return 'JSON'
	}

	// fallback for anything else
	return 'any'
}

/**
 * Capitalize the first character of a string.
 */
export function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1)
}

export function toPascalCase(str: string): string {
	return str
		.split(/[_\s]+/) // split on underscores or spaces
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join('')
}

export function toPascalSingularCase(str: string): string {
	const singular = pluralize.singular(str)
	return toPascalCase(singular)
}
