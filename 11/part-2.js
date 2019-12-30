const _ = require('lodash')
const path = require('path')
const { readCommaLists, wrap, answer, test } = require('../h')

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
const Color = {
	BLACK: 0,
	WHITE: 1,
}
const Rotation = {
	LEFT: 0,
	RIGHT: 1,
}
const Direction = {
	UP: 0,
	RIGHT: 1,
	DOWN: 2,
	LEFT: 3,
}

const Coord = {
	serialize: ([x, y]) => `${x},${y}`,
	deserialize: str => str.split(','),
	add: ([x1, y1], [x2, y2]) => [x1 + x2, y1 + y2],
}

const panelColors = new Map([['0,0', Color.WHITE]])
const getPanelColor = coord => panelColors.get(Coord.serialize(coord))
const paintPanel = (coord, color) =>
	panelColors.set(Coord.serialize(coord), color)

let robotCoord = [0, 0]
let robotDir = Direction.UP
const computation = computeAsync(origInput, () =>
	getPanelColor(robotCoord) === Color.WHITE ? Color.WHITE : Color.BLACK
)
const moveRobot = ({ coord, dir, rotation }) => {
	let delta
	const nextDir = wrap(4, dir + (rotation === Rotation.LEFT ? -1 : 1))
	switch (nextDir) {
		case Direction.UP:
			delta = [0, -1]
			break
		case Direction.RIGHT:
			delta = [1, 0]
			break
		case Direction.DOWN:
			delta = [0, 1]
			break
		case Direction.LEFT:
			delta = [-1, 0]
			break
		default:
			throw new Error(`Invalid direction: ${robotDir}`)
	}
	return {
		coord: Coord.add(coord, delta),
		dir: nextDir,
	}
}

function printRegistration() {
	let [minX, minY, maxX, maxY] = [0, 0, 0, 0]
	for (const coordStr of panelColors.keys()) {
		const [x, y] = Coord.deserialize(coordStr)
		minX = Math.min(x, minX)
		minY = Math.min(y, minY)
		maxX = Math.max(x, maxX)
		maxY = Math.max(y, maxY)
	}
	for (let y = minY; y <= maxY; y++) {
		const row = []
		for (let x = minX; x <= maxX; x++) {
			row.push(getPanelColor([x, y]) === Color.WHITE ? '#' : ' ')
		}
		console.log(row.join(''))
	}
}

while (true) {
	const { value: color } = computation.next()
	const { value: rotation, done } = computation.next()
	paintPanel(robotCoord, color)
	;({ coord: robotCoord, dir: robotDir } = moveRobot({
		coord: robotCoord,
		dir: robotDir,
		rotation,
	}))
	if (done) break
}
printRegistration()
