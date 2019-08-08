function isUrlMatchPattern(url, filter) {
	var regexItem;
	for (var iPattern = 0; iPattern < filter.length; iPattern++) {
		regexItem = new RegExp(filter[iPattern], 'i');
		if (url.match(regexItem) !== null) {
			return true;
		}
	}
	return false;
}

/*
	USAGE:
	--------------

	filter: {
		white: ["", ""], <-- a list of regular expressions (white list)
		black: ["", ""]  <-- a list of regular expressions (black list)
	}
 */

export function isUrlFilterValid (url, filters) {
	// white list
	if (isUrlMatchPattern(url, filters.white)) {
		return true;
	}
	if (filters.white.length !== 0) {
		return false;
	}

	//black list
	return isUrlMatchPattern(url, filters.black) ? false : true;
}

