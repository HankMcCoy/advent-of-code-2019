const path = require('path')
const _ = require('lodash')

const { readLines, range } = require('../h')

const WHITE = 1
const TRANSPARENT = 2
const WIDTH = 25
const HEIGHT = 6
const LAYER_SIZE = WIDTH * HEIGHT

const [dataStr] = readLines(path.join(__dirname, './input.txt'), {
	parseNumbers: false,
})
const data = dataStr.split('').map(x => parseInt(x, 0))
const layers = _.chunk(data, LAYER_SIZE)

const toIdx = (x, y) => y * WIDTH + x
for (let y = 0; y < HEIGHT; y++) {
	console.log(
		range(0, WIDTH - 1)
			.map(x =>
				layers.reduce(
					(c, l) => (c === TRANSPARENT ? l[toIdx(x, y)] : c),
					TRANSPARENT
				)
			)
			.map(c => (c === WHITE ? 'X' : ' '))
			.join('')
	)
}
