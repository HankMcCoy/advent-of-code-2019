const path = require('path')
const { readLines } = require('../h')

const masses = readLines(path.join(__dirname, './input.txt'))

const getFuel = mass => {
	const fuel = Math.floor(mass / 3) - 2
	return fuel <= 0 ? 0 : fuel + getFuel(fuel)
}
const sum = (x, y) => x + y
const totalFuel = masses.map(getFuel).reduce(sum, 0)

console.log(totalFuel)
