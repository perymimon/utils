import {DebugTools, debugToolLog} from "./debug-tools";

export function consoleVerbose(...args) {
	if (DebugTools.isDebugVerboseMode()) {
		console.log.apply(console, args);
		// debugToolLog.apply(null, args);
	}
}

export function consoleLog(...args) {
	if (DebugTools.isDebugMode() || DebugTools.isDebugVerboseMode()) {
		console.log.apply(console, args);
		// debugToolLog.apply(null, args);
	}
}

export function consoleWarning(message, style) {
	if (!DebugTools.isDebugMode() && !DebugTools.isDebugVerboseMode()) {
		return;
	}

	if (!style) {
		style = {
			color: "#FFAD33",
			isBold: false,
			size: 12
		};
	}
	else {
		style.isBold = !!style.isBold;
		style.size = style.size || 12;
	}

	let textStyle = "color:" + style.color + "; font-weight: " + (style.isBold ? "bold" : "normal") + "; font-size:" + style.size + "px";
	console.log("%c" + message, textStyle);
}
