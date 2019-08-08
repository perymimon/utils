const isLocalStorageEnable = (function () {
	try {
		localStorage.setItem("_minTest", "test value");
		localStorage.removeItem("_minTest");
	}
	catch (error) {
		return false;
	}
	return typeof (Storage) !== "undefined";
})();
const isSessionStorageEnable = (function () {
	try {
		sessionStorage.setItem("_minTest", "test value");
		sessionStorage.removeItem("_minTest");
	}
	catch (error) {
		return false;
	}
	return true;
})();

export function getLocalStorage() {
	if (isLocalStorageEnable) {
		return localStorage;
	}
	if (isSessionStorageEnable) {
		return sessionStorage;
	}
	return null;
}

export function getSessionStorage() {
	if (isSessionStorageEnable) {
		return sessionStorage;
	}
	if (isLocalStorageEnable) {
		return localStorage;
	}
	return null;
}

export function storage(section, key,  value){
	const str = localStorage[section];
	const obj = (str && str[0] === '{' && JSON.parse(str))  || str  || {};
	if(arguments.length === 3 ){
		obj[key] = value;
		localStorage[section] = JSON.stringify(obj);
	}else if (arguments.length === 2){
		return obj[key];
	}else if (arguments.length === 1){
		return obj
	}
	return new Error('must give a least section');

}