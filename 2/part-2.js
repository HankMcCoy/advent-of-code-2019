const _ = require('lodash')
const path = require('path')
const { readCommaLists, expect } = require('../h')

const [origInput] = readCommaLists(path.join(__dirname, './input.txt'))

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

function pairWorks(noun, verb) {
	const input = origInput.slice(0)
	input[1] = noun
	input[2] = verb
	const finalTape = compute(input)
	if (finalTape[0] === 19690720) {
		return true
	}
}
for (let noun = 0; noun < 100; noun++) {
	for (let verb = 0; verb < 100; verb++) {
		if (pairWorks(noun, verb)) {
			console.log('FOUND', noun, verb)
			process.exit(0)
		}
	}
}
console.error('No matches found!')
