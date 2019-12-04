const _ = require('lodash')
const path = require('path')
const { answer, test, readCommaLists } = require('../h')

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

const serialize = ({ x, y }) => `${x},${y}`
const getStepCount = (points, target) =>
	_.findIndex(points, p => serialize(p) === serialize(target)) + 1

function getMinSteps(l1, l2) {
	const points1 = convertToPoints(l1)
	const points2 = convertToPoints(l2)
	const intersections = _.intersectionBy(points1, points2, serialize)

	const numSteps = intersections.map(intersect => {
		const steps1 = getStepCount(points1, intersect)
		const steps2 = getStepCount(points2, intersect)
		return steps1 + steps2
	})
	return _.min(numSteps)
}

test(
	getMinSteps(
		'R75,D30,R83,U83,L12,D49,R71,U7,L72'.split(','),
		'U62,R66,U55,R34,D71,R55,D58,R83'.split(',')
	),
	610
)
test(
	getMinSteps(
		'R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51'.split(','),
		'U98,R91,D20,R16,D67,R40,U7,R15,U6,R7'.split(',')
	),
	410
)

answer(getMinSteps(line1, line2))
