export function isArray(list) {
	if (Array.isArray) {
		return Array.isArray(list);
	}
	return Object.prototype.toString.call(list) === '[object Array]';
}

export function cloneArray(items) {
	return Array.prototype.slice.call(items);
}

export function cloneObject(data) {
	let clone = {};
	for (let iKey in data) {
		if (isArray(data[iKey])) {
			clone[iKey] = cloneArray(data[iKey]);
			continue;
		}
		if (data[iKey] === null) {
			clone[iKey] = null;
			continue;
		}
		switch (typeof data[iKey]) {
			case "boolean":
			case "number":
			case "string":
			case "undefined":
				clone[iKey] = data[iKey];
				break;
			case "object":
				clone[iKey] = cloneObject(data[iKey]);
				break;
		}
	}
	return clone;
}
