export function getAdIdFromAd(ad) {
	for (let key in ad) {
		if (typeof ad[key] === "object" && ad[key].hasOwnProperty("adId")) {
			return ad[key].adId;
		}
	}
	return "";
}