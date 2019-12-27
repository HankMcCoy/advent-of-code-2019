const { answer, test, readLines, wrap } = require('../h')
const _ = require('lodash')
const path = require('path')

const input = readLines(path.join(__dirname, './input.txt'), {
	parseNumbers: false,
})
const bestSpot = [8, 16]

const getDelta = ([x1, y1], [x2, y2]) => [x2 - x1, y2 - y1]
const getAngle = (c1, c2) => {
	const [dx, dy] = getDelta(c1, c2)
	return (Math.atan2(dy, dx) * 180) / Math.PI
}
const normalizeAngle = a => wrap(360, a + 90)
test(normalizeAngle(90), 0)
test(normalizeAngle(0), 90)

const getDist = (c1, c2) => {
	const [dx, dy] = getDelta(c1, c2)
	return Math.sqrt(dx ** 2 + dy ** 2)
}

const getAsteroids = asteroidRows => {
	const asteroids = []
	for (let y = 0; y < asteroidRows.length; y++) {
		for (let x = 0; x < asteroidRows[y].length; x++) {
			if (asteroidRows[y][x] === '#') {
				asteroids.push([x, y])
			}
		}
	}
	return asteroids
}

const getCoordsByAngle = (curCoord, otherCoords) => {
	const coordsByAngle = new Map()
	for (const otherCoord of otherCoords) {
		if (_.isEqual(curCoord, otherCoord)) continue

		// Normalize angles to have the same starting point and direction of motion as the beam
		const angle = normalizeAngle(getAngle(curCoord, otherCoord))
		const otherCoordsAtAngle = coordsByAngle.get(angle) || []
		coordsByAngle.set(
			angle,
			_.sortBy([...otherCoordsAtAngle, otherCoord], c => getDist(curCoord, c))
		)
	}
	return _.sortBy(
		[...coordsByAngle.entries()].map(([key, value]) => ({
			angle: key,
			coords: value,
		})),
		'angle'
	)
}

const shootABunchOfAsteroids = asteroidRows => {
	const asteroids = getAsteroids(asteroidRows)
	const asteroidsByAngle = getCoordsByAngle(bestSpot, asteroids)

	let blownUp
	let i = 0
	let numExploded = 0
	while (numExploded < 200) {
		const { angle, coords: targetedAsteroids } = asteroidsByAngle[
			wrap(asteroidsByAngle.length, i)
		]
		if (targetedAsteroids.length) {
			console.log('BOOM', angle, targetedAsteroids.length)
			blownUp = targetedAsteroids.shift()
			numExploded += 1
		}
		i += 1
	}

	answer(blownUp[0] * 100 + blownUp[1])
}

shootABunchOfAsteroids(input)
