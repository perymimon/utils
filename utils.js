export function generateUnique() {
	return "xxxxxxxxxxxx-xxxx-4xxx-yxxxxxx-xxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		let r = Math.random() * 16 | 0, v = c === "x" ? r : r & 3 | 8;
		return v.toString(16);
	});
}

export function generateUID() {
	function s() {
		return Math.floor((1 + Math.random()) * getTimeNow()).toString(16).substring(1);
	}

	return s() + "-" + s() + "-" + s() + "-" + s() + "-" + s();
}

export function getTimeNow() {
	// Changed because publishers might, and did in the past, overrided Date.new() function.
	return (new Date()).getTime();
}

export function isArray(list) {
	if (Array.isArray) {
		return Array.isArray(list);
	}
	return Object.prototype.toString.call(list) === "[object Array]";
}

export function getUserAgent() {
	return window.navigator.userAgent;
}

export function getPageUrl() {
	return window.location.href;
}

export function getPageStructredUrl() {
	return window.location.origin + window.location.pathname;
}

export function getCurrentUrl() {
	try {
		return window.top.location.href;
	}
	catch (error) {
	}
	return window.location.href;
}

const atag = document.createElement("a");
const MINUTE_SOURCE = "minutetv=true";

export function appendMinuteSourceToUrl(url, utm) {

	utm = utm ? utm : MINUTE_SOURCE;

	atag.href = url;
	atag.search += (atag.search ? "&" : "") + utm;
	return atag.href;
}

const REG_END_SLASH = /\/$/;

export function appendUrlEndSlash(url) {
	return REG_END_SLASH.test(url) ? url : (url + "/");
}

