const _ = require('lodash')
const path = require('path')
const { readCommaLists, expect } = require('../h')

const [input] = readCommaLists(path.join(__dirname, './input.txt'))

const ADD = 1
const MULT = 2
const END = 99

function performOp(tape, pos, fn) {
	if (tape.length < pos + 4) {
		throw new Error('Operand out of bounds')
	}
	const a = tape[pos + 1]
	const b = tape[pos + 2]
	const dest = tape[pos + 3]

	tape[dest] = fn(tape[a], tape[b])
}

function compute(tape, pos = 0) {
	const op = tape[pos]
	if (pos === 0) {
		tape = tape.slice(0)
	}
	switch (op) {
		case ADD:
			performOp(tape, pos, (a, b) => a + b)
			return compute(tape, pos + 4)
		case MULT:
			performOp(tape, pos, (a, b) => a * b)
			return compute(tape, pos + 4)
		case END:
			return tape
		default:
			throw new Error('Unexpected op code', op)
	}
}

const test = (inputTape, expectedFinalTape) => {
	const finalTape = compute(inputTape)
	if (_.isEqual(finalTape, expectedFinalTape)) {
		console.log('👍🏻')
	} else {
		console.error('💩')
		console.error('\tINPUT:\t', inputTape)
		console.error('\tOUTPUT:\t', finalTape)
		console.error('\tEXPECTED:\t', finalTapeExpected)
	}
}

test(
	[1, 9, 10, 3, 2, 3, 11, 0, 99, 30, 40, 50],
	[3500, 9, 10, 70, 2, 3, 11, 0, 99, 30, 40, 50]
)
test([1, 0, 0, 0, 99], [2, 0, 0, 0, 99])

input[1] = 12
input[2] = 2
const finalTape = compute(input)
console.log('Answer', finalTape[0])
