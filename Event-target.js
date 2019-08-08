// import {devTool} from 'devtool/futile-devtool'

import {devTool} from "../devtool/futile-devtool";

export function proxyEvent(object, eventName, sourceObject) {
    sourceObject.addEventListener(eventName, function (evt) {
    	// devTool.log(eventName,evt);
        return object.dispatchEvent(evt);
    });
}

export function proxyEvent2(object, eventName, sourceObject, eventNameSource) {
    sourceObject.addEventListener(eventNameSource, function (evt) {
        var event = Object.setPrototypeOf(new Event(eventName), evt);
        return object.dispatchEvent(event);
    });
}


export class Event {
    constructor(type, data) {
        this.type = type;
        this.data = data;
        this.originalTarget = null;
    }
}

/**
 * @typedef {EventListener|function(!Event):*}
 */
var EventListenerType;

/**
 * Creates a new EventTarget. This class implements the DOM level 3
 * EventTarget interface and can be used wherever those are used.
 * @constructor
 * @implements {EventTarget}`
 */
var LISTENERS = Symbol('listeners');
var PROXYS = Symbol('proxys');
var $EVENT_ALL = Symbol('*');

export class EventTarget {
    constructor() {
    }

    /**
     * Adds an event listener to the target.
     * @param {string} type The name of the event.
     * @param {EventListenerType} handler The handler for the event. This is
     *     called when the event is dispatched.
     * @param {AddEventListenerOptions or boolean} option of that types :
     *
     * type (a string)
     * callback (an EventListener)
     * capture (a boolean, initially false)
     * passive (a boolean, initially false)
     * once (a boolean, initially false)
     * removed (a boolean for bookkeeping purposes, initially false)
     */
    addEventListener(type, handler, options) {

        options = options || {};
        handler.capture = options === true || !!(options.capture);
        handler.once = !!options.once;
        handler.passive = !!options.passive;

        this[LISTENERS] = this[LISTENERS] || Object.create(null);

        var flow = handler.capture ? 'capture' : 'bubbling';
        if (!(type in this[LISTENERS])) {
            this[LISTENERS][type] = {capture: [], bubbling: []};
        }
        var handlers = this[LISTENERS][type][flow];
        if (!~handlers.indexOf(handler)) {
            handlers.push(handler);
        }
    }

    addEventListenerOnce(type, handler, options) {
        options.once = true;
        this.addEventListener(type, handler, options);
    }

    addEventListenerAll(handler, options) {
        this.addEventListener($EVENT_ALL, handler, options);
    }

    /**
     * Removes an event listener from the target.
     * @param {string} type The name of the event.
     * @param {EventListenerType} handler The handler for the event.
     */
    removeEventListener(type, handler, options) {
        if (!this[LISTENERS]) {
            return;
        }
        if (type in this[LISTENERS]) {
            options = options || {};
            handler.capture = (options === true ) || !!options.capture;
            var phase = handler.capture ? 'capture' : 'bubbling';
            var handlers = this[LISTENERS][type][phase];
            var index = handlers.indexOf(handler);
            if (index >= 0) {
                // Clean up if this was the last listener.
                if (handlers.length == 1) {
                    this[LISTENERS][type][phase] = [];
                }
                else {
                    handlers.splice(index, 1);
                }
            }
        }
    }

    removeEventListenerAll(handler, options) {
        this.removeEventListener($EVENT_ALL, handler, options)
    }

    /**
     * remove all event listener from the target and basically prepare for destroy
     * @return {void 0}
     */
    removeAllEventListener() {
        this[LISTENERS] = Object.create(null);
    }

    /**
     * register Object that inerighetd from EventTarget to also dispatchEvent all event from this instance
     * @return {void 0}
     */
    proxy(target) {
        this[PROXYS] = this[PROXYS] || [];
        this[PROXYS].push(target);

    }

    /**
     * register Object that inerighetd from EventTarget to also dispatchEvent all event from this instance
     * @return {void 0}
     */
    unproxy(target) {
        if (!this[PROXYS]) return;
        var index = this[PROXYS].indexOf(target);
        if (index >= 0) {
            this[PROXYS].splice(index, 1);
        }

    }

    /**
     * logging all event to the console
     * @param {!name}
     * @return {boolean} Whether the default action was prevented. If someone
     *     calls preventDefault on the event object then this returns false.
     */
    debug(name) {
        var dispatchEvent = this.dispatchEvent;
        this.dispatchEvent = function (event) {
            if (Object.keys(event).length === 0) debugger;
            console.log(name || this.constructor.name,
                event.type, event.data, event);
            dispatchEvent.call(this, event)
        }
    }

    /**
     * Dispatches an event and calls all the listeners that are listening to
     * the type of the event.
     * @param {!Event} event The event to dispatch.
     * @return {boolean} Whether the default action was prevented. If someone
     *     calls preventDefault on the event object then this returns false.
     */
    dispatchEvent(event, type) {
        if (!this[LISTENERS]) {
            return true;
        }
        // Since we are using DOM Event objects we need to override some of the
        // properties and methods so that we can emulate this correctly.
        if (typeof event === 'string') {
            event = new Event(event);
        }
        var self = this;
        if (!(event instanceof window.Event)) {
            event = Object.create(event);
            event.originalTarget = event.originalTarget || this;
            event.__defineGetter__("target", function () {
                return self;
            });
        }
        var type = type || event.type, prevented = 0;

        /** phase capture >> proxy parents > bubbling */
        prevented |= runListenerSequence.call(this, event, type);

        /** then run generic event listeners**/
        if (type !== $EVENT_ALL ) {
            /*prevented |=*/
            runListenerSequence.call(this, event, $EVENT_ALL);
        }

        return !prevented
        /*&& !event.defaultPrevented; it return error when inheriting  from real event*/
    }
}

function runListenerSequence(event, type) {
    var prevented = 0;
    var listenersOfType = this[LISTENERS][type];
    /** capture **/
    if (listenersOfType)
        prevented |= callHandlers(this, listenersOfType['capture'], event);

    if (this[PROXYS]
    /** proxy  parents**/) {
        var i = 0, proxyTarget;
        while (proxyTarget = this[PROXYS][i++]) {
            proxyTarget.dispatchEvent(event, type)
        }
    }
    /** bubbling**/
    if (listenersOfType)
        prevented |= callHandlers(this, listenersOfType['bubbling'], event);

    return prevented
}

function callHandlers(context, handlers, event) {
    // Clone to prevent removal during dispatch
    var prevented = 0;
    var handlersClone = handlers.concat(), i = 0;
    for (var handler; handler = handlersClone[i]; i++) {
        if (handler.handleEvent) {
            prevented |= handler.handleEvent.call(handler, event) === false;
        } else {
            // context.handler = handler;
            prevented |= handler.call(context, event) === false;
        }
    }

    i = handlers.length;
    while (i--) {
        if (handlers[i].once)
            handlers.splice(i, 1);
    }

    return prevented;
}
