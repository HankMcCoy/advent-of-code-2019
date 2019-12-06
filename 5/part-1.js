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

console.log('Testing parseInstruction:')
test(parseInstruction(1), [OpCode.ADD, []])
test(parseInstruction(102), [OpCode.MULT, [Mode.IMMEDIATE]])
test(parseInstruction(1002), [OpCode.MULT, [Mode.POSITION, Mode.IMMEDIATE]])
test(parseInstruction(1102), [OpCode.MULT, [Mode.IMMEDIATE, Mode.IMMEDIATE]])

const log = (...args) => {} //console.log(...args)

function compute(
	tape,
	getInput = () => {
		throw new Error('Oops!')
	}
) {
	tape = tape.slice(0)

	const evaluatePos = pos => {
		// Determine the actual op
		const [opCode, modes] = parseInstruction(tape[pos])
		log('OP   ', opCode)
		log('MODES', modes)

		const getDest = n => {
			return tape[pos + n + 1]
		}
		const getParam = n => {
			const rawParam = tape[pos + n + 1]
			return modes[n] === Mode.IMMEDIATE ? rawParam : tape[rawParam]
		}
		// Determine the params, converting
		switch (opCode) {
			case OpCode.ADD:
				log(getParam(0))
				log(getParam(1))
				log(getDest(2))
				tape[getDest(2)] = getParam(0) + getParam(1)
				return evaluatePos(pos + 4)
			case OpCode.MULT:
				log(getParam(0))
				log(getParam(1))
				log(getDest(2))
				tape[getDest(2)] = getParam(0) * getParam(1)
				return evaluatePos(pos + 4)
			case OpCode.INPUT:
				log(getDest(0))
				tape[getDest(0)] = getInput()
				return evaluatePos(pos + 2)
			case OpCode.OUTPUT:
				log(getParam(0))
				console.log(getParam(0))
				return evaluatePos(pos + 2)
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
test(compute([1101, 100, -1, 4, 0]), [1101, 100, -1, 4, 99])
test(compute([1102, 11, 9, 4, 0]), [1102, 11, 9, 4, 99])
test(
	compute([3, 2, 0], () => 99),
	[3, 2, 99]
)
test(compute([4, 3, 99, 1138]), [4, 3, 99, 1138])

console.log('\nComputing answer:')
compute(origInput, () => 1)
