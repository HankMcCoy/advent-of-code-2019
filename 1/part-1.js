const path = require('path')
const { readLines } = require('../h')

const masses = readLines(path.join(__dirname, './input.txt'))

const getFuel = mass => Math.floor(mass / 3) - 2
const sum = (x, y) => x + y
const totalFuel = masses.map(getFuel).reduce(sum, 0)

console.log(totalFuel)
