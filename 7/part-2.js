const co = require('co')
const _ = require('lodash')
const path = require('path')
const { Transform } = require('stream')
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

const compute = async function(
	tape,
	getInput = () => {
		throw new Error('Oops!')
	},
	outputStream
) {
	// Make a copy of the tape, to mutate
	tape = tape.slice(0)
	const inputGen = getInput()

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
				const input = (await inputGen.next()).value
				tape[getDest(0)] = input
				pos += 2
				break

			case OpCode.OUTPUT:
				outputStream.write(getParam(0))
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
				outputStream.end()
				return

			default:
				throw new Error(
					`Unexpected op code: ${opCode}, instruction: ${tape[pos]}`
				)
		}
	}
}

const createInput = (initialInputs, prevAmpOutput) => {
	return async function*() {
		for (const i of initialInputs) {
			yield i
		}
		for await (const output of prevAmpOutput) {
			yield output
		}
	}
}
const createOutput = () => {
	const stream = new Transform({
		transform(data, encoding, callback) {
			callback(null, data)
		},
		objectMode: true,
	})
	return stream
}

const onFinalValue = (stream, cb) => {
	let lastVal
	stream.on('data', val => {
		lastVal = val
	})
	stream.on('finish', () => {
		cb(lastVal)
	})
}

function getThrust(phases, tape) {
	const outputs = new Array(5).fill().map(() => createOutput())
	const inputs = phases.map((p, i) => {
		return i === 0
			? createInput([p, 0], outputs[4])
			: createInput([p], outputs[i - 1])
	})

	return new Promise((resolve, reject) => {
		for (let i = 0; i < 5; i++) {
			compute(tape, inputs[i], outputs[i])
		}
		onFinalValue(_.last(outputs), thrust => resolve(thrust))
	})
}

const getPermutations = curPhases => {
	return curPhases.length > 1
		? _.flatten(
				curPhases.map(p1 =>
					getPermutations(_.without(curPhases, p1)).map(p2 => [p1, ...p2])
				)
		  )
		: [curPhases]
}

const phasePermutations = getPermutations([5, 6, 7, 8, 9])
async function getMaxThrust(tape) {
	const thrusts = await Promise.all(
		phasePermutations.map(phaseSeq => getThrust(phaseSeq, tape))
	)
	return _.max(thrusts)
}

/*
getMaxThrust(origInput)
	.then(answer)
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
*/

getThrust(
	[9, 8, 7, 6, 5],
	[
		3,
		26,
		1001,
		26,
		-4,
		26,
		3,
		27,
		1002,
		27,
		2,
		27,
		1,
		27,
		26,
		27,
		4,
		27,
		1001,
		28,
		-1,
		28,
		1005,
		28,
		6,
		99,
		0,
		0,
		5,
	]
).then(thrust => {
	test(thrust, 139629729)
})
/*
getThrust([5, 6, 7, 8, 9], origInput)
	.then(thrust => {
		console.log('DONE', thrust)
	})
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	*/
