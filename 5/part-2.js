const _ = require('lodash')
const path = require('path')
const { readCommaLists, test } = require('../h')

const [origInput] = readCommaLists(path.join(__dirname, './input.txt'))

// Params
const OpCode = {
	ADD: 1,
	MULT: 2,
	INPUT: 3,
	OUTPUT: 4,
	JUMP_IF_TRUE: 5,
	JUMP_IF_FALSE: 6,
	LESS_THAN: 7,
	EQUALS: 8,
	END: 99,
}

// Modes
const Mode = {
	POSITION: 0,
	IMMEDIATE: 1,
}

const parseInstruction = instruction => {
	const opCode = instruction % 100
	const modes = []
	for (let i = Math.floor(instruction / 100); i >= 1; i = Math.floor(i / 10)) {
		modes.push(i % 10 ? Mode.IMMEDIATE : Mode.POSITION)
	}
	return [opCode, modes]
}

function compute(
	tape,
	getInput = () => {
		throw new Error('Oops!')
	}
) {
	// Make a copy of the tape, to mutate
	tape = tape.slice(0)

	const evaluatePos = pos => {
		// Determine the actual op
		const [opCode, modes] = parseInstruction(tape[pos])

		const getDest = n => tape[pos + n + 1]
		const getParam = n => {
			const rawParam = tape[pos + n + 1]
			return modes[n] === Mode.IMMEDIATE ? rawParam : tape[rawParam]
		}
		// Determine the params, converting
		switch (opCode) {
			case OpCode.ADD:
				tape[getDest(2)] = getParam(0) + getParam(1)
				return evaluatePos(pos + 4)

			case OpCode.MULT:
				tape[getDest(2)] = getParam(0) * getParam(1)
				return evaluatePos(pos + 4)

			case OpCode.INPUT:
				tape[getDest(0)] = getInput()
				return evaluatePos(pos + 2)

			case OpCode.OUTPUT:
				console.log(getParam(0))
				return evaluatePos(pos + 2)

			case OpCode.JUMP_IF_TRUE:
				return getParam(0) !== 0
					? evaluatePos(getParam(1))
					: evaluatePos(pos + 3)

			case OpCode.JUMP_IF_FALSE:
				return getParam(0) === 0
					? evaluatePos(getParam(1))
					: evaluatePos(pos + 3)

			case OpCode.LESS_THAN:
				tape[getDest(2)] = getParam(0) < getParam(1) ? 1 : 0
				return evaluatePos(pos + 4)

			case OpCode.EQUALS:
				tape[getDest(2)] = getParam(0) === getParam(1) ? 1 : 0
				return evaluatePos(pos + 4)

			case OpCode.END:
				return tape

			default:
				throw new Error(
					`Unexpected op code: ${opCode}, instruction: ${tape[pos]}`
				)
		}
	}

	return evaluatePos(0)
}

console.log('\nTesting compute:')
test(compute([1105, 1, 4, 0, 99]), [1105, 1, 4, 0, 99])
test(compute([1105, 0, 4, 99, 0]), [1105, 0, 4, 99, 0])
test(compute([1106, 0, 4, 0, 99]), [1106, 0, 4, 0, 99])
test(compute([1106, 1, 4, 99, 0]), [1106, 1, 4, 99, 0])
test(
	compute([
		// Since 2 is less than 3, write "1" to idx 5
		1107,
		2,
		3,
		5,
		// Now the first arg for the JUMP_IF_TRUE op is 1, so jump to the end
		1105,
		0,
		10,
		// Noise...
		88,
		88,
		88,
		// The end!
		99,
	]),
	// Same as above, but with the 1 written in pos 6
	[1107, 2, 3, 5, 1105, 1, 10, 88, 88, 88, 99]
)
test(
	compute([
		// Since 38 equals 38, write "1" to idx 5
		1108,
		38,
		38,
		5,
		// Now the first arg for the JUMP_IF_TRUE op is 1, so jump to the end
		1105,
		0,
		10,
		// Noise...
		88,
		88,
		88,
		// The end!
		99,
	]),
	// Same as above, but with the 1 written in pos 6
	[1108, 38, 38, 5, 1105, 1, 10, 88, 88, 88, 99]
)
console.log('Expect 1 output:')
compute([3, 9, 8, 9, 10, 9, 4, 9, 99, -1, 8], () => 8)
console.log('Expect 0 output:')
compute([3, 9, 8, 9, 10, 9, 4, 9, 99, -1, 8], () => 0)

console.log('Expect 999:')
compute(
	[
		3,
		21,
		1008,
		21,
		8,
		20,
		1005,
		20,
		22,
		107,
		8,
		21,
		20,
		1006,
		20,
		31,
		1106,
		0,
		36,
		98,
		0,
		0,
		1002,
		21,
		125,
		20,
		4,
		20,
		1105,
		1,
		46,
		104,
		999,
		1105,
		1,
		46,
		1101,
		1000,
		1,
		20,
		4,
		20,
		1105,
		1,
		46,
		98,
		99,
	],
	() => 1
)

console.log('Expect 1001:')
compute(
	[
		3,
		21,
		1008,
		21,
		8,
		20,
		1005,
		20,
		22,
		107,
		8,
		21,
		20,
		1006,
		20,
		31,
		1106,
		0,
		36,
		98,
		0,
		0,
		1002,
		21,
		125,
		20,
		4,
		20,
		1105,
		1,
		46,
		104,
		999,
		1105,
		1,
		46,
		1101,
		1000,
		1,
		20,
		4,
		20,
		1105,
		1,
		46,
		98,
		99,
	],
	() => 10
)

console.log('\nComputing answer:')
compute(origInput, () => 5)
