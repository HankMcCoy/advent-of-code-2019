const path = require('path')
const { readCommaLists } = require('../h')

const [line1, line2] = readCommaLists(path.join(__dirname, './input.txt'), {
	parseNumbers: false,
})

const parseInstruction = instruction => {
	return [instruction[0], parseInt(instruction.slice(1), 10)]
}
function convertToLineSegments(
	[instruction, ...line],
	{ x, y } = { x: 0, y: 0 },
	segments = []
) {
	const [op, magnitude] = parseInstruction(instruction)
	let nextCoord
	if (op === 'U') {
		nextCoord = { x, y: y + magnitude }
	} else if (op === 'D') {
		nextCoord = { x, y: y - magnitude }
	} else if (op === 'L') {
		nextCoord = { x: x - magnitude, y }
	} else if (op === 'R') {
		nextCoord = { x: x + magnitude, y }
	} else {
		throw new Error('Unknown op', op)
	}

	if (!line.length) {
		return segments
	}
	return convertToLineSegments(line, nextCoord, [
		...segments,
		[{ x, y }, nextCoord],
	])
}

const segments1 = convertToLineSegments(line1)
const segments2 = convertToLineSegments(line2)

function getIntersection(seg1, seg2) {
	// Hrm… how to handle overlapping segments?
}
function getIntersections(segments1, segments2) {
	const intersections = []
	for (let seg1 of segments1) {
		for (let seg2 of segments2) {
			const intersection = getIntersection(seg1, seg2)
			if (intersections) {
				intersections.push(intersection)
			}
		}
	}
	return intersections
}
getIntersections(segments1, segments2)
