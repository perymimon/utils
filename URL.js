const searchParams = decodeURIComponent(location.search);

export function getUrlParam(name) {
	const paramValueReg = new RegExp(name + '=?([^&]*)');
	const res = paramValueReg.exec(searchParams);
	return res ? (res[1] || 'auto') : '';
}

