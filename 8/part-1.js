const path = require('path')
const _ = require('lodash')

const { readLines, answer } = require('../h')

const WIDTH = 25
const HEIGHT = 6
const LAYER_SIZE = WIDTH * HEIGHT
const [dataStr] = readLines(path.join(__dirname, './input.txt'), {
	parseNumbers: false,
})
const data = dataStr.split('').map(x => parseInt(x, 0))
const layers = _.chunk(data, LAYER_SIZE)
const layerInfos = layers.map(l => {
	const numZeroes = l.filter(x => x === 0).length
	const numOnes = l.filter(x => x === 1).length
	const numTwos = l.filter(x => x === 2).length
	return {
		numZeroes,
		checksum: numOnes * numTwos,
	}
})
const bestLayer = _.minBy(layerInfos, li => li.numZeroes)
answer(bestLayer.checksum)
