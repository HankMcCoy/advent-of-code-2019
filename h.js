const fs = require('fs')

function readFile(path) {
	return fs.readFileSync(path, { encoding: 'utf8' })
}
exports.readFile = readFile

function readLines(path, { parseNumbers } = { parseNumbers: true }) {
	return readFile(path)
		.split('\n')
		.filter(x => x)
		.map(x => (parseNumbers ? parseInt(x, 10) : x))
}
exports.readLines = readLines

function readCommaLists(path, { parseNumbers } = { parseNumbers: true }) {
	return readLines(path, { parseNumbers: false })
		.map(line => line.split(','))
		.map(list => list.map(x => (parseNumbers ? parseInt(x, 10) : x)))
}
exports.readCommaLists = readCommaLists
