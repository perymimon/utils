import {EventTarget, Event} from './Event-target';
import {Deferred} from './Deferred';
import {devTool} from 'devtool/futile-devtool.js'

const internalData = Symbol('internalData');
const firstAddPromise = Symbol('firstAddPromise');
const last = Symbol('last');
const current = Symbol('current');

export const QueueEvents = {
	ADD: "add",
	PUSHED: "pushed",
	POPED: "poped",
};

export class Queue extends EventTarget {
	constructor(debugSection, debugName, array, strict) {
		super();

        // support no debug
        const noDebug = arguments[0] instanceof Array;
        array = noDebug ? arguments[0] : array;

		this.data = (Array.isArray(array) ) ? array : [];
		this[internalData] = this.data.filter(Boolean);
		this[firstAddPromise] = Deferred();
		this.i = 0;

        noDebug || turnOnDebug.call(this, debugSection, debugName);

		this.go(0);
	}

    debug(debugSection, debugName) {
        turnOnDebug.call(this, debugSection, debugName)
    }

	get firstAdding() {
		return this[firstAddPromise].promise;
	}

	get current() {
		return this[current];
	}

	get last() {
		return this[last] || this[current];
	}

	add(datum, i) {
		this[internalData][i] = datum;
		// do that for save the order of the videos
		mergeJustCleanValues(this.data, this[internalData]);
		this[current] = this.data[this.i];
		this.dispatchEvent(new Event(QueueEvents.ADD, datum));
		this[firstAddPromise].resolve();
		devNotify.call(this);
		return this;
	}

	remove(i) {
		let removedData = this[internalData][i];
		delete this[internalData][i];
		mergeJustCleanValues(this.data, this[internalData]);
		this.dispatchEvent(new Event('remove', removedData));
		devNotify.call(this);
		return this;
	}

	go(i/*absolute or relative number '+1'| '-1' | 1 */) {
		if (i === void 0) return this.current;
		this[last] = this.data[this.i];
		i = /[+-]/.exec(i[0])? this.i + Number(i) : Number(i);
		this.i = ( (this.data.length + i) % (this.data.length || 1));
		// // console.log(this.debugName, this.i);
		this[current] = this.data[this.i];
		devNotify.call(this);

		return this[current];
	}

	peek(i/*absolute or relative number '+1'| '-1' | 1 */) {
		i = /[+-]/.exec(i[0])? this.i + Number(i) : Number(i);
		i = ( (this.data.length + i) % (this.data.length || 1));
		return this.data[i];
	}

	calcDirection(i/*absolute or relative number '+1'| '-1' | 1 */){
		switch (i[0]){
			case '+': return 'next'; break;
			case '-': return 'prev'; break;
		}
		// i = /[+-]/.exec(i[0])? this.i + Number(i) : Number(i);
		i = Number(i);
		return i > this.i ? 'next': this.i === i ? 'current' : 'prev';
	}

	prev() {
		return this.go(this.i - 1);
	}

	next() {
		return this.go(this.i + 1);
	}

	push(datum) {
		this[internalData].push(datum);
		mergeJustCleanValues(this.data, this[internalData]);
		this[current] = this.data[this.i];
		this.dispatchEvent(new Event(QueueEvents.ADD, datum));
		this[firstAddPromise].resolve();
		// const event = new Event(QueueEvents.PUSHED, datum);
		// event.value = datum;
		this.dispatchEvent(new Event(QueueEvents.PUSHED, datum));
		devNotify.call(this);
		return this;
	}

	pop() {
		// const value = this.data.shift();
		const value = this.peek(0);
		if (value) {
			let i = this[internalData].indexOf(value);
			this[internalData][i] = null;

			mergeJustCleanValues(this.data, this[internalData]);

			let event = new Event(QueueEvents.POPED);
			event.value = value;
			this.dispatchEvent(event);
		}
		devNotify.call(this);
		return value;
	}



}

function mergeJustCleanValues(orginalArray, fromArray) {
	orginalArray.length = 0; //clear array
	Object.assign(orginalArray, fromArray.filter(Boolean));
}

function turnOnDebug(debugSection, debugName) {
	this.debugSection = debugSection;
	this.debugName = debugName;
    devNotify.call(this);
}
function devNotify() {
	if (!this.debugName) return;
	// if(this.i === 0){
	// 	devTool.notify(this.debugSection, this.debugName, `${this.data.length}`);
	// }else{
		devTool.notify(this.debugSection, this.debugName, `${this.i}/${this.data.length}`);
	// }

}