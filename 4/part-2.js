const { test, answer, invariant } = require('../h')

const getDigits = num =>
	num
		.toString()
		.split('')
		.map(x => parseInt(x, 10))

const isValidPassword = num => {
	const digits = getDigits(num)
	invariant(digits.length === 6)

	const groups = digits.reduce((groups, digit) => {
		const curGroup = groups[groups.length - 1]
		if (curGroup && curGroup.digit === digit) {
			curGroup.count += 1
		} else {
			groups.push({
				digit,
				count: 1,
			})
		}
		return groups
	}, [])

	return (
		// At least one digit pair
		groups.some(g => g.count === 2) &&
		// Every digit must be greater than or equal to the previous
		groups.every((g, i) => i === 0 || groups[i - 1].digit < g.digit)
	)
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
	122333,
	122334,
	122335,
	122336,
	122337,
	122338,
	122339,
])

answer(getValidPasswords(271973, 785961).length)
