import {cloneArray} from "./data-utils";

export function createDebouncer(timeout, callback, context) {
	var _timeout = timeout;
	var _callback = callback;
	var _context = context || null;
	var _args = cloneArray(arguments).slice(3);
	var _timeoutCode = 0;
	var _timeFilter = 0;
	var _anchorTime = 0;
	var _echoTime = 0;
	var _echoRepeat = 1;
	var _echoCurrentRepeat = 0;

	function enableFilter(time) {
		_timeFilter = time || _timeout;
	}

	function setEcho(time, repeat) {
		_echoTime = time || _timeout;
		_echoRepeat = repeat || _echoRepeat;
	}

	function start() {
		var args = arguments.length > 0 ? cloneArray(arguments) : _args;
		_checkTimeFilter(args);
		_startEcho(args);
	}

	function stop() {
		_clear();
		_anchorTime = 0;
	}

	function kill() {
		_clear();
		_callback = null;
		_context = null;
		_args = null;
	}

	var _checkTimeFilter = function (args) {
		if (_timeFilter <= 0) {
			return;
		}

		var currentTime = Date.now();

		if (_anchorTime === 0) {
			_anchorTime = currentTime;
		}

		var isPassFilterTime = currentTime > (_anchorTime + _timeFilter);
		if (isPassFilterTime) {
			_callback.apply(_context, args);
			_anchorTime = currentTime;
		}
	};

	var _startEcho = function (args) {
		var argsClone = cloneArray(args);
		_clear();
		_echoCurrentRepeat = 0;
		_timeoutCode = setTimeout(function timeoutHandler() {
			if ((_echoCurrentRepeat + 1) === _echoRepeat) {
				argsClone = argsClone.concat(true);
			}
			_callback.apply(_context, argsClone);
			_echoCurrentRepeat++;
			if (_echoCurrentRepeat < _echoRepeat) {
				setTimeout(timeoutHandler, _timeout);
			}
			stop();
		}, _timeout);
	};

	function isRunning() {
		return _timeoutCode > 0;
	}

	function _clear() {
		if (isRunning()) {
			clearTimeout(_timeoutCode);
			_timeoutCode = 0;
		}
	}

	return {
		enableFilter: enableFilter,
		setEcho: setEcho,
		start: start,
		stop: stop,
		kill: kill,
		isRunning: isRunning
	}
};
