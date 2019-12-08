const _ = require('lodash')
const fs = require('fs')

const readFile = path => fs.readFileSync(path, { encoding: 'utf8' })
exports.readFile = readFile

const readLines = (path, { parseNumbers } = { parseNumbers: true }) =>
	readFile(path)
		.split('\n')
		.filter(x => x)
		.map(x => (parseNumbers ? parseInt(x, 10) : x))
exports.readLines = readLines

const readCommaLists = (path, { parseNumbers } = { parseNumbers: true }) =>
	readLines(path, { parseNumbers: false })
		.map(line => line.split(','))
		.map(list => list.map(x => (parseNumbers ? parseInt(x, 10) : x)))
exports.readCommaLists = readCommaLists

const test = (actual, expected) => {
	if (_.isEqual(actual, expected)) {
		console.log('👍🏻')
	} else {
		console.error('💩')
		console.error('- EXPECTED: ', expected)
		console.error('- ACTUAL:   ', actual)
	}
}
exports.test = test

const answer = result => {
	console.log(`\n🎉🎉🎉${result} 🎉🎉🎉`)
}
exports.answer = answer

const invariant = predicate => {
	if (!predicate) {
		throw new Error('WTF MAN')
	}
}
exports.invariant = invariant

const getPermutations = curPhases => {
	return curPhases.length > 1
		? _.flatten(
				curPhases.map(p1 =>
					getPermutations(_.without(curPhases, p1)).map(p2 => [p1, ...p2])
				)
		  )
		: [curPhases]
}
exports.getPermutations = getPermutations

function range(min, max) {
	return new Array(max - min + 1).fill().map((__, i) => i + min)
}
exports.range = range
