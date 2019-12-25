const { answer, readLines } = require('../h')
const _ = require('lodash')
const path = require('path')

const input = readLines(path.join(__dirname, './input.txt'), {
	parseNumbers: false,
})

const getAngle = ([x1, y1], [x2, y2]) => {
	const dx = x2 - x1
	const dy = y2 - y1

	return Math.atan2(dy, dx)
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

const getVisibility = (curCoord, otherCoords) => {
	const anglesSeen = new Set()
	for (const otherCoord of otherCoords) {
		if (_.isEqual(curCoord, otherCoord)) continue
		const angle = getAngle(curCoord, otherCoord)
		anglesSeen.add(angle)
	}
	return anglesSeen.size
}

const getVisibilityMap = asteroidRows => {
	const asteroids = getAsteroids(asteroidRows)
	return asteroids.map(a => getVisibility(a, asteroids))
}

answer(Math.max(...getVisibilityMap(input)))
