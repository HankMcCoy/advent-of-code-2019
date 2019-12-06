const path = require('path')

const { readLines, test, answer } = require('../h')

const inputOrbitList = readLines(path.join(__dirname, './input.txt'), {
	parseNumbers: false,
}).map(line => line.split(')'))

const getOrbitalTransferCount = orbitList => {
	const orbitsBySatellite = {}
	for (let [primary, satellite] of orbitList) {
		orbitsBySatellite[satellite] = primary
	}

	const getOrbitChain = target => {
		const primary = orbitsBySatellite[target]
		return !primary ? [] : [primary, ...getOrbitChain(primary)]
	}

	const getNearestCommonAncestor = (chain1, chain2) => {
		for (let obj of chain1) {
			if (chain2.includes(obj)) {
				return obj
			}
		}
		throw new Error('No common ancestor!')
	}

	const sanOrbitChain = getOrbitChain('SAN')
	const youOrbitChain = getOrbitChain('YOU')
	const nearestAncestor = getNearestCommonAncestor(sanOrbitChain, youOrbitChain)
	return (
		sanOrbitChain.indexOf(nearestAncestor) +
		youOrbitChain.indexOf(nearestAncestor)
	)
}

test(
	getOrbitalTransferCount([
		['COM', 'YOU'],
		['COM', 'SAN'],
	]),
	0
)
test(
	getOrbitalTransferCount([
		['COM', 'A'],
		['A', 'YOU'],
		['COM', 'SAN'],
	]),
	1
)
test(
	getOrbitalTransferCount([
		['COM', 'A'],
		['COM', 'B'],
		['A', 'YOU'],
		['B', 'SAN'],
	]),
	2
)
test(
	getOrbitalTransferCount([
		['COM', 'B'],
		['B', 'C'],
		['C', 'D'],
		['D', 'E'],
		['E', 'F'],
		['B', 'G'],
		['G', 'H'],
		['D', 'I'],
		['E', 'J'],
		['J', 'K'],
		['K', 'L'],
		['K', 'YOU'],
		['I', 'SAN'],
	]),
	4
)

answer(getOrbitalTransferCount(inputOrbitList))
