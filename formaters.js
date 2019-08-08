export function formatNumber(num, width) {
	const array = [];
	array.length = width;
	array.fill('0');
	num = (num + '').split('').reverse();
	Object.assign(array, num);
	return array.reverse().join('');
}