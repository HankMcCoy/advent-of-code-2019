const _ = require('lodash')
const path = require('path')
const { readCommaLists } = require('../h')

const [line1, line2] = readCommaLists(path.join(__dirname, './input.txt'), {
	parseNumbers: false,
})

const parseInstruction = instruction => [
	instruction[0],
	parseInt(instruction.slice(1), 10),
]
const performOp = (op, coord) => {
	switch (op) {
		case 'U':
			return { x: coord.x, y: coord.y + 1 }
		case 'D':
			return { x: coord.x, y: coord.y - 1 }
		case 'L':
			return { x: coord.x - 1, y: coord.y }
		case 'R':
			return { x: coord.x + 1, y: coord.y }
		default:
			throw new Error('Unknown op', op)
	}
}
function convertToPoints(
	[instruction, ...line],
	prevCoord = { x: 0, y: 0 },
	points = []
) {
	const [op, magnitude] = parseInstruction(instruction)

	let curCoord = prevCoord
	for (let i = 0; i < magnitude; i++) {
		curCoord = performOp(op, curCoord)
		points.push(curCoord)
	}

	if (!line.length) {
		return points
	}
	return convertToPoints(line, curCoord, points)
}

const points1 = convertToPoints(line1)
const points2 = convertToPoints(line2)

function getIntersections(points1, points2) {
	return _.intersectionBy(points1, points2, ({ x, y }) => `${x},${y}`)
}
const manhattan = ({ x, y }) => Math.abs(x) + Math.abs(y)
const closest = getIntersections(points1, points2).reduce(
	(closest, curPoint) => {
		return !closest || manhattan(curPoint) < manhattan(closest)
			? curPoint
			: closest
	},
	undefined
)
console.log('Manhattan', manhattan(closest))
