// import 'utils/hammer'
import {$} from 'utils/dom'
import {passiveSupported} from "utils/detections"

const eventOptions = passiveSupported ? {passive:true}: false;

export function swipeAndPen($dom, config) {

	let start = null;
	let end = null;

	let isSwipeCancel;
	let setting = Object.assign({
		delta: $dom.getBoundingClientRect().width / 2,
		velocity: .5
	}, config);
	let panStartRight = true, panStartLeft = true;
	let prevent = false;
	// console.log('delta', setting.delta);

	$dom.addEventListener('touchstart', starting, false);
	// $dom.addEventListener('touchstart', preventPropagation, false);

	// function preventPropagation(event) {
     //    event.preventDefault();
    // }

	const state = {
		set start(event) {
			start = pointStamp(event.touches[0])
		},
		get start() {
			return start
		},
		set end(event) {
			end = pointStamp(event.touches[0])
		},
		get end() {
			return end
		},
		get delta() {
			var end = this.end, start = this.start;
			return {
				x: end.x - start.x,
				y: end.y - start.y,
				time: end.timeStamp - start.timeStamp
			}
		},
		get velocity() {
			var delta = this.delta;
			return {
				vx: delta.x / delta.time,
				vy: delta.y / delta.time
			}
		}
	};

	function preventGestures() {
		prevent = true;
	}

	function starting(event) {
		prevent = false;
		isSwipeCancel = true;
		panStartRight = false;
		panStartLeft = false;
		$dom.dispatchEvent(cloneEvent('panstart', event));
		$dom.addEventListener('touchmove', moving, false);
		// todo : check that for contextmenu Element.setPointerCapture()
		$dom.addEventListener('contextmenu', ending, eventOptions);
		if (prevent) return;
		state.start = event;
		state.end = event;


		$dom.focus(); // wtf: for what this good?
		return true;
	}


	function moving(event) {

		$dom.addEventListener('touchend', ending, eventOptions);
		if (prevent) return;
		state.end = event;

		if(panStartRight || panStartLeft || Math.abs(state.velocity.vx) > Math.abs((state.velocity.vy) )){
		    event.preventDefault();
        }else{
		    return true; //prevent fire right/left event
        }

		if (state.delta.x > 0) {
			//todo:check it again
			!panStartRight && $dom.dispatchEvent(cloneEvent('panstartright', event, {pan: state.delta.x}));
			panStartRight = true;
			panStartLeft = !panStartRight;
		} else {
			!panStartLeft && $dom.dispatchEvent(cloneEvent('panstartleft', event, {pan: state.delta.x}));
			panStartLeft = true;
			panStartRight = !panStartLeft;
		}

		// console.log('moving');

		$dom.dispatchEvent(cloneEvent('pan', event, {pan: state.delta.x}));

		// $dom.dispatchEvent(cloneEvent(state.delta.x > 0 ? 'panright' : 'panleft', event, {pan: state.delta.x}));


		return false;
	}

	function ending(event) {
		if (!prevent) {
			/** is it moving**/
			if ( panStartLeft || panStartRight ) {
				/** is it swiping? **/
				if (Math.abs(state.delta.x) >= setting.delta || Math.abs(state.velocity.vx) >= setting.velocity) {
					isSwipeCancel = false;
					const EVENT_NAME = state.delta.x > 0 ? 'swiperight' : 'swipeleft';
					$dom.dispatchEvent(cloneEvent(EVENT_NAME, event));
					// ending(event)
				}

				if (isSwipeCancel) {
					$dom.dispatchEvent(cloneEvent('swipecancel', event));
				}
			}
		}
		$dom.removeEventListener('contextmenu', ending, false);
		$dom.removeEventListener('touchmove', moving, false);
		$dom.removeEventListener('touchend', ending, false);
		$dom.dispatchEvent(cloneEvent('panend', event));
	}

	function pointStamp(touche) {
		return {
			x: touche.clientX,//screenX,
			y: touche.clientY,//screenY,
			timeStamp: Date.now()
		}
	}

	function cloneEvent(type, event, data) {
		var evt = new Event(type);
		Object.assign(evt, data, {
			preventGestures: preventGestures /*handel to cancel futer event until next start touch*/
		});
		return Object.setPrototypeOf(evt, event);
	}


}

// IE10 and IE11 on Windows Phone have a small tap highlight when you tap an element.
// Adding this meta tag removes this.
export function disableTapHighlightIE() {
	const removeTapHighlightIE = $.create('meta', 'name="msapplication-tap-highlight" content="no"');
	document.head.appendChild(removeTapHighlightIE);
}