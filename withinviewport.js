import {consoleWarning} from "./console";
import {createDebouncer} from "./debounce";
import {Event, EventTarget} from "./Event-target";
import {getConfiguration} from "../data/configuration";
import {sendErrorReport} from "../reports/reportsManager";

function isIFrame() {
	return window.self !== window.top;
}

function isWindowSecutiryAllowed() {
	if (!isIFrame()) {
		return true;
	}
	try {
		window.top.document.getElementById;
		return true;
	}
	catch (error) {
	}
	return false;
}

function getElementViewportPercents(element) {
	let view = {
		width: window.top.innerWidth,
		height: window.top.innerHeight,
	};
	let rect = element.getBoundingClientRect();
	let vh = 0, vw = 0;
	if (rect.top >= 0) {
		vh = Math.min(rect.height, view.height - rect.top);
	}
	else if (rect.bottom > 0) {
		vh = Math.min(view.height, rect.bottom);
	}
	if (rect.left >= 0) {
		vw = Math.min(rect.width, view.width - rect.left);
	}
	else if (rect.right > 0) {
		vw = Math.min(view.width, rect.right);
	}
	return vh * vw / (rect.height * rect.width);
}

const VIEWPORT_DEBOUNCER_TIME = 200;
export const VISIBILITY_TYPES = {
	AD: "ad",
	APV: "apv",
	SPLASH: "splash",
	MINUTE: "minute",
};

export const VIEWPORT_EVENT = "viewportEvent";
export const VIEWPORT_TYPES = {
	IN: "viewportIn",
	OUT: "viewportOut",
};

class ViewportElementTrack extends EventTarget {
	constructor(element, viewport) {
		super();

		this._lastVisibllity = false;
		this._isWindowSecure = isWindowSecutiryAllowed();
		this._iframe = undefined;
		this._domElement = element;
		this._viewport = viewport;

		this._viewDebounce = createDebouncer(VIEWPORT_DEBOUNCER_TIME, this._checkViewports, this);
		this._viewDebounce.enableFilter();

		this._initWindowEvents();

		// consoleLog(`Start with visible Ad ${getConfiguration().getConfig().getViewportAd()}%:, ${this.getAdVisibility()}`);
		// consoleLog(`Start with visible Minute ${getConfiguration().getConfig().getViewportMinute()}%:, ${this.getMinuteVisibility()}`);
	}

	getVisibility() {
		const visiblePercent = this._getCurrentVisibility();
		return (visiblePercent >= this._viewport);
	}

	getInPromise() {
		return this._getVisibilityPromise(VIEWPORT_TYPES.IN, () => this.getVisibility());
	}

	getOutPromise() {
		return this._getVisibilityPromise(VIEWPORT_TYPES.OUT, () => !this.getVisibility());
	}

	/**
	 * @private
	 */
	_getVisibilityPromise(viewportType, checkFunc) {
		return new Promise((res, rej) => {
			if (checkFunc()) {
				res();
				return;
			}

			const handleViewport = (event) => {
				if (event.data === viewportType) {
					this.removeEventListener(VIEWPORT_EVENT, handleViewport);
					res();
				}
			};
			this.addEventListener(VIEWPORT_EVENT, handleViewport);
		});
	}

	/**
	 * @private
	 */
	_getCurrentVisibility() {
		let isVisible = !document.hidden;
		if (!this._isWindowSecure || !isVisible) {
			return isVisible ? 100 : 0;
		}

		if (!isIFrame()) {
			return getElementViewportPercents(this._domElement) * 100;
		}
		else if (this._getIFrameElement()) {
			return getElementViewportPercents(this._getIFrameElement()) * 100;
		}

		const message = "No IFrame found for current window.";
		consoleWarning(message);
		sendErrorReport(message);
		return 100;
	}

	/**
	 * @private
	 */
	_initWindowEvents() {
		const startDebouncer = this._viewDebounce.start.bind(this._viewDebouncer);
		document.addEventListener("visibilitychange", startDebouncer);
		if (this._isWindowSecure) {
			window.top.addEventListener("scroll", startDebouncer);
			window.top.addEventListener("resize", startDebouncer);
		}
	}

	/**
	 * @private
	 */
	_getIFrameElement() {
		if (typeof this._iframe !== "undefined") {
			return this._iframe;
		}

		const iframeList = window.top.document.getElementsByTagName("iframe");
		for (var iFrame = 0; iFrame < iframeList.length; iFrame++) {
			var frame = iframeList[iFrame];
			if (frame.contentWindow === window.self) {
				this._iframe = frame;
				return this._iframe;
			}
		}
		this._iframe = null;
		return this._iframe;
	}

	/**
	 * @private
	 */
	_checkViewports() {
		let isInViewport;
		const visiblePercent = this._getCurrentVisibility();

		// TODO: add qadt tool
		//console.log('visiblePercent: ' + visiblePercent + '%');

		isInViewport = (visiblePercent >= this._viewport);
		if (this._lastVisibllity !== isInViewport) {
			this._lastVisibllity = isInViewport;
			let event = new Event(VIEWPORT_EVENT, this._lastVisibllity ? VIEWPORT_TYPES.IN : VIEWPORT_TYPES.OUT);
			this.dispatchEvent(event);
		}
	}
}

const _trackerList = [];

function getViewportPercent(type) {
	const config = getConfiguration().getConfig();
	switch (type) {
		case VISIBILITY_TYPES.AD:
			return config.getViewportAd();
		case VISIBILITY_TYPES.SPLASH:
		case VISIBILITY_TYPES.APV:
			return config.getViewportApv();
		case VISIBILITY_TYPES.MINUTE:
			return config.getViewportMinute();
	}
	console.error("not suppose to get here.");
}

export function createTracker(element, type) {
	for (var iTracker = 0; iTracker < _trackerList.length; iTracker++) {
		const trackData = _trackerList[iTracker];
		if (trackData.element === element && trackData.type === type) {
			return trackData.tracker;
		}
	}
	const trackData = {
		tracker: new ViewportElementTrack(element, getViewportPercent(type)),
		element: element,
		type: type,
	};
	_trackerList.push(trackData);
	return trackData.tracker;
}
