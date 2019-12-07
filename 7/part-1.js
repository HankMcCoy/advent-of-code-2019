const _ = require('lodash')
const path = require('path')
const { readCommaLists, test, answer } = require('../h')

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
	},
	output = console.log
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
				output(getParam(0))
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
const defineInput = inputs => {
	let i = 0
	return () => {
		const input = inputs[i]
		i += 1
		return input
	}
}

function getThrust(phases, tape) {
	const getAmplifierOutput = _.curry((phase, input) => {
		let result
		compute(tape, defineInput([phase, input]), x => {
			result = x
		})
		return result
	})
	return _.flow(
		getAmplifierOutput(phases[0]),
		getAmplifierOutput(phases[1]),
		getAmplifierOutput(phases[2]),
		getAmplifierOutput(phases[3]),
		getAmplifierOutput(phases[4])
	)(0)
}
test(
	getThrust(
		[4, 3, 2, 1, 0],
		[3, 15, 3, 16, 1002, 16, 10, 16, 1, 16, 15, 15, 4, 15, 99, 0, 0]
	),
	43210
)

const getPermutations = curPhases => {
	return curPhases.length > 1
		? _.flatten(
				curPhases.map(p1 =>
					getPermutations(_.without(curPhases, p1)).map(p2 => [p1, ...p2])
				)
		  )
		: [curPhases]
}
test(getPermutations([1]), [[1]])
test(getPermutations([1, 2]), [
	[1, 2],
	[2, 1],
])
test(getPermutations([1, 2, 3]), [
	[1, 2, 3],
	[1, 3, 2],
	[2, 1, 3],
	[2, 3, 1],
	[3, 1, 2],
	[3, 2, 1],
])

const phasePermutations = getPermutations([0, 1, 2, 3, 4])
function getMaxThrust(tape) {
	return _.max(phasePermutations.map(phaseSeq => getThrust(phaseSeq, tape)))
}

answer(getMaxThrust(origInput))
