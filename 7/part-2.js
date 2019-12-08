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

const compute = function*(tape, getInput, writeOutput) {
	// Make a copy of the tape, to mutate
	tape = tape.slice(0)

	let pos = 0
	while (true) {
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
				yield writeOutput(getParam(0))
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

			case OpCode.END:
				return

			default:
				throw new Error(
					`Unexpected op code: ${opCode}, instruction: ${tape[pos]}`
				)
		}
	}
}

const NUM_AMPS = 5
const LAST_AMP = NUM_AMPS - 1
const amps = range(0, LAST_AMP)
function getThrust(phases, tape) {
	const queues = amps.map(i => (i === 0 ? [phases[0], 0] : [phases[i]]))
	const inputQueue = i => queues[i]
	const outputQueue = i => (i === LAST_AMP ? queues[0] : queues[i + 1])

	const computations = amps.map(i => {
		const getInput = () => inputQueue(i).shift()
		const writeOutput = val => {
			outputQueue(i).push(val)
		}
		return compute(tape, getInput, writeOutput)
	})

	let states = new Array(NUM_AMPS).fill('RUNNING')
	while (states.includes('RUNNING')) {
		states = computations.map(g => (g.next().done ? 'DONE' : 'RUNNING'))
	}

	return outputQueue(LAST_AMP)[0]
}

const phasePermutations = getPermutations(range(5, 9))
function getMaxThrust(tape) {
	const thrusts = phasePermutations.map(phaseSeq => getThrust(phaseSeq, tape))
	return _.max(thrusts)
}

test(
	getThrust(
		[9, 8, 7, 6, 5],
		// prettier-ignore
		[3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,
		27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5]
	),
	139629729
)

test(
	getThrust(
		[9, 7, 8, 5, 6],
		// prettier-ignore
		[3,52,1001,52,-5,52,3,53,1,52,56,54,1007,54,5,55,1005,55,26,1001,54,
		-5,54,1105,1,12,1,53,54,53,1008,54,0,55,1001,55,1,55,2,53,55,53,4,
		53,1001,56,-1,56,1005,56,6,99,0,0,0,0,10]
	),
	18216
)

answer(getMaxThrust(origInput))
