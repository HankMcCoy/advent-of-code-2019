const _ = require('lodash')
const path = require('path')
const { readCommaLists, test, answer, getPermutations, range } = require('../h')

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
	ADJ_BASE: 9,
	END: 99,
}

// Modes
const Mode = {
	POSITION: 0,
	IMMEDIATE: 1,
	RELATIVE: 2,
}
const parseInstruction = instruction => {
	const opCode = instruction % 100
	const modes = []
	for (let i = Math.floor(instruction / 100); i >= 1; i = Math.floor(i / 10)) {
		const mode = i % 10
		if (mode > Mode.RELATIVE) throw new Error(`Invalid mode: ${mode}`)
		modes.push(mode)
	}
	return [opCode, modes]
}

const computeAsync = function*(
	tape,
	getInput = () => {
		throw new Error('No input provided')
	},
	writeOutput = () => {}
) {
	let relativeBase = 0
	// Make a copy of the tape, to mutate
	tape = tape.slice(0)

	let pos = 0
	while (true) {
		const readTape = i => (tape[i] === undefined ? 0 : tape[i])
		const [opCode, modes] = parseInstruction(readTape(pos))
		const getParam = n => {
			const rawParam = readTape(pos + n + 1)
			switch (modes[n]) {
				case undefined:
				case Mode.POSITION:
					return readTape(rawParam)
				case Mode.IMMEDIATE:
					return rawParam
				case Mode.RELATIVE:
					return readTape(relativeBase + rawParam)
				default:
					throw new Error(`Invalid mode: ${modes[n]}`)
			}
		}
		const getDest = n => {
			switch (modes[n]) {
				case undefined:
				case Mode.POSITION:
					return readTape(pos + n + 1)
				case Mode.RELATIVE:
					return relativeBase + readTape(pos + n + 1)
				default:
					throw new Error(`Invalid mode for dest: ${modes[n]}`)
			}
		}
		// Determine the params, converting
		switch (opCode) {
			case OpCode.ADD:
				tape[getDest(2)] = getParam(0) + getParam(1)
				pos += 4
				break

			case OpCode.MULT:
				tape[getDest(2)] = getParam(0) * getParam(1)
				pos += 4
				break

			case OpCode.INPUT:
				tape[getDest(0)] = getInput()
				pos += 2
				break

			case OpCode.OUTPUT:
				writeOutput(getParam(0))
				yield getParam(0)
				pos += 2
				break

			case OpCode.JUMP_IF_TRUE:
				pos = getParam(0) !== 0 ? getParam(1) : pos + 3
				break

			case OpCode.JUMP_IF_FALSE:
				pos = getParam(0) === 0 ? getParam(1) : pos + 3
				break

			case OpCode.LESS_THAN:
				tape[getDest(2)] = getParam(0) < getParam(1) ? 1 : 0
				pos += 4
				break

			case OpCode.EQUALS:
				tape[getDest(2)] = getParam(0) === getParam(1) ? 1 : 0
				pos += 4
				break

			case OpCode.ADJ_BASE:
				relativeBase += getParam(0)
				pos += 2
				break

			case OpCode.END:
				return yield tape

			default:
				throw new Error(
					`Unexpected op code: ${opCode}, instruction: ${tape[pos]}`
				)
		}
	}
}

const compute = (...args) => {
	const output = []
	for (value of computeAsync(...args)) {
		output.push(value)
	}
	return output
}

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
	])[0],
	// Same as above, but with the 1 written in pos 6
	[1108, 38, 38, 5, 1105, 1, 10, 88, 88, 88, 99]
)

// prettier-ignore
const printsItselfTape = [109,1,204,-1,1001,100,1,100,1008,100,16,101,1006,101,0,99]
test(
	compute(printsItselfTape).slice(0, printsItselfTape.length),
	printsItselfTape
)

const prints16DigitNumTape = [1102, 34915192, 34915192, 7, 4, 7, 99, 0]
test(compute(prints16DigitNumTape)[0].toString().length, 16)

test(compute([104, 1125899906842624, 99])[0], 1125899906842624)

answer(compute(origInput, () => 1)[0])
