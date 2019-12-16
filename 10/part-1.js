const { test, readLines } = require('../h')
const path = require('path')

const input = readLines(path.join(__dirname, './input.txt'), {
	parseNumbers: false,
})

const unit = x => (x > 0 ? 1 : x === 0 ? 0 : -1)
test(unit(12), 1)
test(unit(-3.4), -1)
test(unit(0), 0)

const simplifiedDelta = ([x1, y1], [x2, y2]) => {
	const dx = x2 - x1
	const dy = y2 - y1

	if (dy === 0) return [unit(dx), 0]
	if (dx % dy === 0) return [unit(dx) * (dx / dy), unit(dy)]
	if (dy % dx === 0) return [unit(dx), unit(dy) * (dy / dx)]
	return [dx, dy]
}
test(simplifiedDelta([0, 0], [0, 1]), [0, 1])
test(simplifiedDelta([0, 0], [2, 6]), [1, 3])
test(simplifiedDelta([3, 4], [1, 2]), [-1, -1])
test(simplifiedDelta([33, 4], [17, 65]), [-16, 61])

const getAsteroids = asteroidRows => {
	const asteroids = []
	for (let y = 0; y < asteroidRows.length; y++) {
		for (let x = 0; x < asteroidRows[y].length; x++) {
			if (asteroidRows[y][x] === '#') {
				asteroids.push({ coord: [x, y] })
			}
		}
	}
	return asteroids
}

const serializePoint = ([x, y]) => `${x},${y}`
const deserializePoint = str => {
	const [x, y] = str.split(',')
	return [x, y]
}
const comparePointLists = (list1, list2) => {
	return _.isEqual(
		list1.map(serializePoint).sort(),
		list2.map(serializePoint).sort()
	)
}

const getNextNeighbors = (points, width, height) => {}
test(
	comparePointLists(getNextNeighbors([0, 0], 1, 1), [
		[1, 0],
		[0, 1],
	]),
	true
)

const getVisibility = (curAsteroid, asteroids) => {
	for (const otherAsteroid of asteroids) {
		if (_.isEqual(curAsteroid, otherAsteroid)) continue
	}
}

const getVisibilityMap = asteroidRows => {
	const asteroids = getAsteroids(asteroidRows)
	return asteroids.map(a => getVisibility(a, asteroids))
}

getVisibilityMap(input)
