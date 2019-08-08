import {devTool} from '../devtool/futile-devtool';
import {MIN_VERSIONS_COMPATIBLE, MIN_MOBILE_OS_COMPATIBLE} from '../setting';
import {clone, overrideObjectItems} from './objectManipuliation';
import {compareVersions, convertVersionToNumbers} from './versionValidator';

var Compatibility = function () {

	var _vendor;
	var _version = 0;
	var _min_version = 99;
	var _objectFitSupport;
	var _isMobile;
	var _isUserAgentDebug;
	var _isUserAgentFacebook;
	var _isAndroid = null;
	var _androidVersion = null;

	var _supportBrowserList = {};
	var _supportOSList = {};

	var _userAgent = (navigator.userAgent || "").toLowerCase();
	var _blacklist = /opr\/|opera|Yandex|SeaMonkey|Maxthon|Avant|Deepnet|Comodo_Dragon|Dooble|Palemoon|Flock|facebookexternalhit|Facebot/i;

	_setIsMobile();

	var vendorFunctions = _createVendorFunctions(_userAgent);
	var _isIE = !!vendorFunctions.msie();
	var _isEdge = !!vendorFunctions.edge();
	var _isFF = !!vendorFunctions.firefox();

	function _loadOverrideLists(configData) {
		var configBrowserList;
		var configOSList;
		var compatibility = configData.compatibility;

		switch (typeof compatibility) {
			case "undefined":
				return;
			case "string":
				compatibility = JSON.parse(compatibility);
				break;
		}

		if (_isMobile) {
			_supportBrowserList = clone(MIN_VERSIONS_COMPATIBLE.mobile);
			configBrowserList = compatibility.mobile || {};
			overrideObjectItems(configBrowserList, _supportBrowserList);

			_supportOSList = clone(MIN_MOBILE_OS_COMPATIBLE);
			configOSList = compatibility.os || {};
			overrideObjectItems(configOSList, _supportOSList);
		}
		else {
			_supportBrowserList = clone(MIN_VERSIONS_COMPATIBLE.desktop);
			configBrowserList = compatibility.desktop || {};
			overrideObjectItems(configBrowserList, _supportBrowserList);
		}

	}

	function _getAndroidVersion() {
		if (_isAndroid !== null) {
			return _androidVersion;
		}

		var version = _userAgent.match(/android\s*(\d+\.?\d*\.?\d*)/i);
		if (!version || version.length !== 2) {
			_isAndroid = false;
			_androidVersion = null;
		}
		else {
			_isAndroid = true;
			_androidVersion = convertVersionToNumbers(version[1].split("."));
		}
		return _androidVersion;
	}

	function _version_for(userAgent, regexp_match, regexp_ignore, version_index_pos) {
		var version = null;
		if (regexp_ignore && userAgent.match(regexp_ignore)) {
			return version;
		}

		version_index_pos = version_index_pos || 2;
		var match = userAgent.match(regexp_match);
		if (match) {
			version = parseInt(match[version_index_pos], 10);
			// version = Number( match[version_index_pos].split(".",2).join(".") );
		}
		return version;
	}

	function _createVendorFunctions(userAgent) {

		return {
			"firefox": function () {
				return _version_for(userAgent, /mozilla\/[\w\.]+.+rv\:.+gecko\/\d+.+(firefox)\/([\w\.]+)/i, _blacklist);
			},
			"edge": function () {
				return _version_for(userAgent, /(edge)\/((\d+)?[\w\.]+)/i, _blacklist);
			},
			"chrome": function () {
				return _version_for(userAgent, /(chrome)\/v?([\w\.]+)/i, _blacklist);
			},
			"msie": function () {
				var ie11 = _version_for(userAgent, /(trident).+rv[:\s]([\w\.]+).+like\sgecko/i);
				var lower_ver = _version_for(userAgent, /(?:ms|\()(ie)\s([\w\.]+)/i);
				return ie11 || lower_ver;
			},
			"safari": function () {
				return _version_for(userAgent, /version\/([\w\.]+).+?(mobile\s?safari|safari)/i, _blacklist, 1);
			},
			"crios": function () {
				return _version_for(userAgent, /(CriOS)\/v?([\w\.]+)/i, _blacklist, 2);
			}
		};
	}

	function _getiOSVersion() {
		// var IOS_REGEX = /(?:iPhone|iPod|iPad|MacIntel)/i;     // For Test on Mac
		var IOS_REGEX = /(?:iPhone|iPod|iPad)/i;
		var version;

		if (IOS_REGEX.test(_userAgent)) {
			version = (_userAgent).match(/OS (\d+)_(\d+)_?(\d+)?/i);
			return version ? convertVersionToNumbers(version.slice(1, 3)) : null;
		}
		return null;
	}

	function _checkMobileOS() {
		var versionOS;
		var versionBrowser;

		if (!_isMobile) {
			return false;
		}

		versionOS = _getAndroidVersion();
		if (versionOS) {
			versionBrowser = vendorFunctions.chrome();
			if (versionBrowser >= _supportBrowserList.chrome || compareVersions(versionOS, _supportOSList.android) >=0) {
				_version = versionBrowser;
			}
			else {
				_version = 0;
			}
			_vendor = "chrome";
			_min_version = _supportBrowserList.chrome;
			return true;
		}

		versionOS = _getiOSVersion();
		if (versionOS) {
			var iOsVersion = compareVersions(versionOS, _supportOSList.ios) >= 0;
			if (iOsVersion) {
				// check if safari or ChiOS
				var crIos = vendorFunctions.crios();
				if (crIos) {
					_version = crIos;
					_min_version = _supportBrowserList.crios;
					_vendor = "crios";
				}
				else {
					_version = versionOS[0];
					_vendor = "safari";
					_min_version = _supportBrowserList.safari;
				}

				return true;
			}
		}

		return false;
	}

	function _checkDesktop() {
		var version;

		for (var vendor in _supportBrowserList) {
			if (!vendorFunctions[vendor]) {
				devTool.log("Can't find vendor '" + vendor + "' version function in comparability");
				continue;
			}

			version = vendorFunctions[vendor]();
			if (version) {
				_version = version;
				_vendor = vendor;
				_min_version = _supportBrowserList[vendor];
				return true;
			}
		}
		return false;
	}

	function _validateDebug(configData) {
		var list = configData.userAgentDebugTime || [];
		var search;

		for (var i = 0; i < list.length; i++) {
			search = new RegExp(list[i], "i");
			if (search.test(_userAgent)) {
				_isUserAgentDebug = true;
				return;
			}
		}
		_isUserAgentDebug = false;
	}

	function _setIsMobile() {
		if (typeof _isMobile != "boolean") {
			_isMobile = (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(_userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(_userAgent.substr(0, 4)))
		}
	}

	function init(configData) {
		_loadOverrideLists(configData);

		var isFoundMobile = _checkMobileOS();
		if (!isFoundMobile) {
			_checkDesktop();
		}
		_validateDebug(configData);
		_checkFacebookUserAgent();
	}

	function _checkFacebookUserAgent() {
		var List = ["fban", "fbav", "fbios"];
		_isUserAgentFacebook = false;
		for (var i = 0; i < List.length; i++) {
			if (_userAgent.indexOf(List[i]) > -1) {
				_isUserAgentFacebook = true;
				break;
			}
		}
	}

	function isBrowserSupported() {
		if (_version < _min_version) {
			return false
		}
		if (_isMobile) {
			var versionOS = _getAndroidVersion();
			if (versionOS) {
				return compareVersions(versionOS, _supportOSList.android) >= 0;
			}

			versionOS = _getiOSVersion();
			if (versionOS) {
				return compareVersions(versionOS, _supportOSList.ios) >= 0;
			}
		}

		return true;
	}

	function isSafari() {
		return /^((?!chrome|android|crios).)*(safari|iphone|ipad)/i.test(_userAgent);
	}

	function isIE() {
		return _isIE;
	}

	function isEdge() {
		return _isEdge;
	}

	function isFF() {
		return _isFF;
	}

	function isObjectFitSupported() {
		if (typeof _objectFitSupport !== 'undefined') {
			return _objectFitSupport;
		}
		var objectFitMinVersion = {
			"firefox": 36,
			"safari": 7.1,
			"chrome": 31,
			"crios": 99
		};
		_objectFitSupport = !!objectFitMinVersion[_vendor] && _version >= objectFitMinVersion[_vendor];

		return _objectFitSupport;
	}

	function isUserAgentDebug() {
		return _isUserAgentDebug;
	}

	function isUserAgentFacebook() {
		return _isUserAgentFacebook;
	}

	function isScraperEnabled() {
		return !_isIE && !_isEdge;
	}

	function checkPlacement(data) {
		if (!data || !data.desktop) {
			return true;
		}

		var version;

		for (var vendor in data.desktop) {
			if (!vendorFunctions[vendor]) {
				continue;
			}

			version = vendorFunctions[vendor]();
			if (!version) {
				continue;
			}
			return version >= data.desktop[vendor];
		}
		return true;
	}

	function isMobile() {
		return _isMobile;
	}

	function getiOSVersion(){
		if (!isMobile()){
			return 0;
		}
		if (_getiOSVersion() === null){
			return 0;
		}
		return _getiOSVersion()[0];
	}

	function getiOSFullVersion(){
		if (!isMobile()){
			return 0;
		}
		var version = _getiOSVersion();
		if (version === null){
			return 0;
		}
		return parseFloat(version[0] + "." + version[1]);
	}

	function isIosSafari() {
		return isMobile() && !!_getiOSVersion() && isSafari();
	}

	function isChrome(){
		return !!vendorFunctions.chrome();
	}

	function getChromeVersion(){
		return isChrome() ? vendorFunctions.chrome() : null;
	}

	function isAndroid(){
		return !!_getAndroidVersion();
	}

	function getAndroidMajorVersion(){
		var version = _getAndroidVersion();
		return version ? version[0] : 0;
	}

	function isiPad(){
		return navigator.platform === "iPad";
	}

	function getMobileAnalyticsCode() {
		return isMobile() ?
			consts.Emitter.ANALYTICS_SOURCE_WEB_MOBILE : consts.Emitter.ANALYTICS_SOURCE_WEB_DESKTOP;
	}

	return {
		init: init,
		isBrowserSupported: isBrowserSupported,
		isSafari: isSafari,
		isIE: isIE,
		isEdge: isEdge,
		isFF: isFF,
		isObjectFitSupported: isObjectFitSupported,
		isUserAgentDebug: isUserAgentDebug,
		isUserAgentFacebook: isUserAgentFacebook,
		isScraperEnabled: isScraperEnabled,
		checkPlacement: checkPlacement,
		isMobile: isMobile,
		getiOSVersion: getiOSVersion,
		getiOSFullVersion: getiOSFullVersion,
		isChrome: isChrome,
		getChromeVersion: getChromeVersion,
		isAndroid: isAndroid,
		getAndroidMajorVersion: getAndroidMajorVersion,
		isiPad:isiPad,
		isIosSafari: isIosSafari,
		getMobileAnalyticsCode: getMobileAnalyticsCode
	}
};

var compatibility = new Compatibility();
export default compatibility;



