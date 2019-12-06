const path = require('path')
const _ = require('lodash')

const { readLines, answer } = require('../h')

const orbitList = readLines(path.join(__dirname, './input.txt'), {
	parseNumbers: false,
}).map(line => line.split(')'))

const orbitsBySatellite = {}
for (let [primary, satellite] of orbitList) {
	orbitsBySatellite[satellite] = primary
}

const getOrbitCount = _.memoize(satellite => {
	const primary = orbitsBySatellite[satellite]
	if (!primary) {
		return 0
	}
	return 1 + getOrbitCount(primary)
})

const objs = _.uniq(_.flatten(orbitList))

const orbitCount = objs.reduce((count, obj) => count + getOrbitCount(obj), 0)

answer(orbitCount)
