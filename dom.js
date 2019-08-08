import {cloneArray} from "utils/data-utils"

export let $ = document.querySelector.bind(document);
export let $$$ = function () {
	return cloneArray(document.querySelectorAll.apply(document, arguments));
};
export default $;

$.create = create;

$.getQuery = function getQuery(context) {
	const $ = document.querySelector.bind(context);
	$.create = create;
	return $;
};

$$$.getQuery = function getQuery(context) {
	const $$$ = document.querySelectorAll.bind(context);
	$$$.create = create;

	return $$$;
};

// $.create =     document.createElement.bind(document);
function create(elementName, attrsString) {
	let elm;
	if (elementName.trim()[0] === '<') {
		elm = createDomFromText(elementName, !!attrsString);
	} else {
		elm = document.createElement(elementName);

		if (attrsString && elm.setAttribute) {
			const cach = [];
			// replace all string with quotation marks with ____
			attrsString = attrsString.replace(/"(.*?)"/, function (_, match) {
				cach.push(match);
				return '____'
			});
			attrsString.split(' ').forEach(attr => {

				let [k, v] = attr.split('=');
				elm.setAttribute(k, (v === "____") ? cach.pop() : ( v || ''))
			});
		}
	}

	return elm;
};

function createDomFromText(domString, returnFragment) {
	const tmpDiv = document.createElement('div');
	tmpDiv.innerHTML = domString;
	const fragment = document.createDocumentFragment();
	Array.from(tmpDiv.children).forEach(dom => {
		fragment.appendChild(dom);
	});
	return returnFragment ? fragment : fragment.firstChild;
}


export function sibiling(dom, query) {
	var doms = dom.parentElement.querySelectorAll(query);
    return [].slice.call(doms).filter( d => d != dom);
}
