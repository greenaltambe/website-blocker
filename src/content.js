const currentDomain = window.location.hostname.replace(/^www\./, "");
console.log("Current domain:", currentDomain);

chrome.storage.local.get(["blockedSites", "startTime", "endTime"], (data) => {
	const { blockedSites, startTime, endTime } = data;

	if (!blockedSites || !startTime || !endTime) {
		console.log("No settings found");
		return;
	}

	const now = new Date();
	const currentTime = now.getHours() * 60 + now.getMinutes();
	console.log("Current time:", currentTime);

	const [startHour, startMin] = startTime.split(":").map(Number);
	const [endHour, endMin] = endTime.split(":").map(Number);
	console.log("Focus time:", startHour, startMin, endHour, endMin);

	const startTotal = startHour * 60 + startMin;
	const endTotal = endHour * 60 + endMin;
	console.log("Total focus time:", startTotal, endTotal);

	const isInFocusTime = startTotal <= currentTime && currentTime <= endTotal;
	const isBlocked = blockedSites.includes(currentDomain);

	console.log("Is in focus time:", isInFocusTime);
	console.log("Is blocked:", isBlocked);

	if (isInFocusTime && isBlocked) {
		window.location.href = chrome.runtime.getURL("../pages/block.html");
		console.log("Redirected to block.html");
	}
});
