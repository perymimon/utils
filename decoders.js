const REGEX_BASE64 = /^[A-Z0-9+\/]*[=+]*$/i;
export function jsonParse(value) {
	if (typeof value !== "string") {
		return value;
	}
	if (REGEX_BASE64.test(value)) {
		value = atob(value);
	}

	// No try/cache wrapper because we need to have an exception if JSON is not valid. that never suppose to occur.
	return JSON.parse(value);
}

export function parseBool(data, defaultValue) {
	if (typeof data === "undefined" && typeof defaultValue !== "undefined") {
		return defaultValue;
	}
	return (data === "true") || (data === true);
}