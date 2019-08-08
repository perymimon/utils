if (typeof  Object.values !== 'function') {
	Object.defineProperty(Object.prototype,'values',{
		value: function (obj) {
			const ret = [];
			for (let k in obj) {
				if (obj.hasOwnProperty(k))
					ret.push(obj[k]);
			}
			return ret;
		}
	})
}

if (typeof  Object.keys !== 'function') {
	Object.defineProperty(Object.prototype,'keys',{
		value: function (obj) {
			const ret = [];
			for (let k in obj) {
				if (obj.hasOwnProperty(k))
					ret.push(k);
			}
			return ret;
		}
	})
}

if (typeof  Array.from !== 'function') {
	Object.defineProperty(Array.prototype,'from',{
		value: function (pesdoArray) {
			return Array.prototype.slice.call(pesdoArray);
		}
	})
}
