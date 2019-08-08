export function compareVersions(verArr1, verArr2) {

	if (verArr1.length !== verArr2.length) {
		return null;
	}

	for (var iPart = 0; iPart < verArr2.length; iPart++) {
		if (verArr1[iPart] < verArr2[iPart]) {
			return -1;
		}
		if (verArr1[iPart] > verArr2[iPart]) {
			return 1;
		}
	}
	// versions identical
	return 0;
};

export function convertVersionToNumbers(versionData, places) {
	var MAX_VERSION_PARTS = places ? places : 3;
	var versionParts = versionData.map(function (value) {
		return parseInt(value, 10);
	});
	var missingParts = MAX_VERSION_PARTS - versionParts.length;

	for (var iPart = missingParts; iPart > 0; iPart--) {
		versionParts.push(0);
	}

	return versionParts;
};

