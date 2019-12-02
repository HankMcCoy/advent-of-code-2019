const fs = require('fs')

function readFile(path) {
	return fs.readFileSync(path, { encoding: 'utf8' })
}
exports.readFile = readFile

function readLines(path) {
	return readFile(path)
		.split('\n')
		.filter(x => x)
}
exports.readLines = readLines

function readNumberLines(path) {
	return readLines(path).map(x => parseInt(x, 10))
}
exports.readNumberLines = readNumberLines
