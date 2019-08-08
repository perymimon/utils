const _qaList = (function (){

    let topWindow = window;
    const REGEX_QADT = /(?:qadt([\d\w_\-]+)=([\d\w_\-]+))/g;
    // wtf: why not use just window.top ?
    while (topWindow !== window.parent){
        topWindow = window.parent;
    }

    let search;
    let params = {};

    while ((search = REGEX_QADT.exec(topWindow.location.search)) !== null){
        params[search[1]] = search[2];
    }

    return params;
}());

export class DebugTools
{
    static enableDebugMode(){
        _qaList.debugMode = "true";
    }
	static disableDebugMode(){
		_qaList.debugMode = "false";
	}
	static enableDebugVerboseMode(){
        _qaList.debugVerboseMode = "true";
    }
    static isDebugMode(){
        return _qaList.debugMode === "true";
    }
    static isDebugVerboseMode(){
        return _qaList.debugVerboseMode === "true";
    }
}

export function debugToolLog(...args){
    let value = "";
    args.forEach((item) => value += JSON.stringify(item));
}
