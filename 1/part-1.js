const path = require('path')
const { readNumberLines } = require('../h')

const masses = readNumberLines(path.join(__dirname, './input.txt'))

const getFuel = mass => Math.floor(mass / 3) - 2
const sum = (x, y) => x + y
const totalFuel = masses.map(getFuel).reduce(sum, 0)

console.log(totalFuel)
