const { test, answer } = require('../h')

const isValidPassword = num => {
	const digits = num
		.toString()
		.split('')
		.map(x => parseInt(x, 10))

	if (digits.length !== 6) {
		return false
	}

	let hasPair = false
	for (let i = 1; i < digits.length; i++) {
		hasPair = hasPair || digits[i - 1] === digits[i]
		if (digits[i - 1] > digits[i]) {
			return false
		}
	}
	return hasPair
}

test(isValidPassword(111111), true)
test(isValidPassword(122345), true)
test(isValidPassword(223450), false)
test(isValidPassword(123789), false)

function getValidPasswords(min, max) {
	const validPasswords = []
	for (let n = min; n <= max; n++) {
		if (isValidPassword(n)) {
			validPasswords.push(n)
		}
	}
	return validPasswords
}

test(getValidPasswords(122345, 122350), [
	122345,
	122346,
	122347,
	122348,
	122349,
])

answer(getValidPasswords(271973, 785961).length)
