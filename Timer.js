import {devTool} from "../devtool/futile-devtool";

const DONE = Symbol('Done');
const thenQueue = Symbol('then queue');
const tickQueue = Symbol('tick queue');
const debugName = Symbol('debug name');
const COOL_NOTIFY_TIMER = Symbol('cool notify timer');

export class Timer {
    constructor(time, callback, autostart) {
        this.orginalTime = this.time = time;
        this.callback = callback;
        this.timer = null;
        this[thenQueue] = [];
        this[tickQueue] = [];
        this[COOL_NOTIFY_TIMER] = [];
        this.finishedCounter = 0;
        autostart && this.restart();
    }

    debug(name) {
        this[debugName] = name;
    }

    stop() {
        clearTimeout(this.timer);
        coolNotify.call(this);
        this.timer = null;
        this.endTime = Date.now();
        let timepass = this.endTime - this.startTime;
        this[debugName] && devTool.log('timer', this[debugName], ':stop time pass', timepass);
    }

    setTime(newTime) {
        this.time = newTime;
        this.orginalTime = newTime;
        this[debugName] && devTool.log('timer', this[debugName], ':set time', newTime);
    }

    restart() {
        this[debugName] && devTool.log('timer', this[debugName], ':restart', this.time);
        clearTimeout(this.timer);
        coolNotify.call(this);
        this[DONE] = false;
        this.startTime = Date.now();
        this.endTime = this.startTime;

        igniteAllNotify.call(this);

        this.timer = setTimeout(() => {
            this.finishedCounter++;
            this.stop();
            this.endTime = this.startTime + this.time;
            this[DONE] = true;
            this.callback && this.callback();
            lastTimeNotify.call(this);
            runThenQueu.call(this);
        }, this.time);


    }

    pause() {
        this[debugName] && console.log('timer', this[debugName], ':pause');
        this.stop();
    }

    resume() {
        this[debugName] && console.log('timer', this[debugName], ':resume');
        if (this.timer) return;
        let timePass = this.endTime - this.startTime;
        this.time = this.orginalTime - timePass;
        this.restart();
        this.startTime -= timePass;
        this.time = this.orginalTime;
    }

    tick(callback, time) {
        this[tickQueue].push([callback, time]);
        igniteNotify.call(this, callback, time);
    }

    get progress() {
        let now = this.timer ? Date.now() : this.endTime;
        let t = ((now - this.startTime) / this.orginalTime) * 100;
        return t;
    }

    then(res, rej) {
        this[thenQueue].push(res);
        if (this[DONE]) {
            runThenQueu.call(this)
        }
    }
}

function runThenQueu() {
    this[thenQueue].forEach(callback => callback());
    this[thenQueue] = [];
}

function coolNotify() {
    this[COOL_NOTIFY_TIMER].forEach(clear => clear());
    this[COOL_NOTIFY_TIMER] = [];
}

function igniteNotify(callback, time) {
    let t , me = this;
    function cycle() {
        if (!me) return;
        t = setTimeout(() => {
            requestAnimationFrame(function () {
                callback();
                cycle()
            })
        }, time)
    }

    cycle();

    function clear() {
        clearTimeout(t);
    }

    this[COOL_NOTIFY_TIMER].push(clear);
    return clear;
}

function lastTimeNotify() {
    this[tickQueue].forEach(args => args[0/*callback*/]());  //wtf: what that it do ?
}

function igniteAllNotify() {
    return this[tickQueue].map(args => igniteNotify.apply(this, args));
}

/**--------------SIMPLE TIMER------------------**/
export function simpleTimer(callback, time) {
    var cancel = setTimeout(callback, time);
    return function () {
        clearTimeout(cancel);
    }

}


