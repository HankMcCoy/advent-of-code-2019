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
	let prev = digits[0]
	let prevCount = 1
	for (let i = 1; i < digits.length; i++) {
		if (digits[i] === prev) {
			prevCount += 1
			if (prevCount > 2) {
				return false
			}
		} else {
			prev = digits[i]
			prevCount = 1
		}
		hasPair = hasPair || digits[i - 1] === digits[i]
		if (digits[i - 1] > digits[i]) {
			return false
		}
	}
	return hasPair
}

test(isValidPassword(111111), false)
test(isValidPassword(111333), false)
test(isValidPassword(122345), true)
test(isValidPassword(112233), true)
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

test(getValidPasswords(122333, 122340), [
	122334,
	122335,
	122336,
	122337,
	122338,
	122339,
])

answer(getValidPasswords(271973, 785961).length)
