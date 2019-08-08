export function overrideObjectItems (source, target) {
	for (var key in target) {
		if (source.hasOwnProperty(key)) {
			target[key] = source[key];
		}
	}
}

export function clone(obj) {
	return JSON.parse(JSON.stringify(obj));
}
