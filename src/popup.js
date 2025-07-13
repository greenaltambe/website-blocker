document.addEventListener("DOMContentLoaded", () => {
	const sitesInput = document.getElementById("sites");
	const startInput = document.getElementById("start");
	const endInput = document.getElementById("end");
	const saveButton = document.getElementById("save");
	const status = document.getElementById("status");
	const addCurrentSiteInput = document.getElementById(
		"add-current-site-input"
	);
	const addCurrentSiteButton = document.getElementById(
		"add-current-site-btn"
	);

	// Add current site to input
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		const hostname = new URL(tabs[0].url).hostname.replace(/^www\./, "");
		console.log("Current site:", hostname);
		addCurrentSiteInput.value = hostname;
		addCurrentSiteInput.disabled = true;
	});

	// Add current site
	addCurrentSiteButton.addEventListener("click", () => {
		const site = addCurrentSiteInput.value;

		// Check if site is already blocked
		chrome.storage.local.get("blockedSites", (data) => {
			const blockedSites = data.blockedSites || [];
			const isBlocked = blockedSites.includes(site);

			if (isBlocked) {
				status.textContent = "Site is already blocked";
				setTimeout(() => (status.textContent = ""), 2000);
			} else {
				blockedSites.push(site);
				sitesInput.value = blockedSites.join(", ");
			}
		});
	});

	// Load saved settings
	chrome.storage.local.get(
		["blockedSites", "startTime", "endTime"],
		(data) => {
			if (data.blockedSites) {
				sitesInput.value = data.blockedSites.join(", ");
				console.log("Loaded blocked sites:", data.blockedSites);
			}
			if (data.startTime) {
				startInput.value = data.startTime;
				console.log("Loaded start time:", data.startTime);
			}
			if (data.endTime) {
				endInput.value = data.endTime;
				console.log("Loaded end time:", data.endTime);
			}
		}
	);

	// Save settings
	saveButton.addEventListener("click", () => {
		const sites = sitesInput.value
			.split(",")
			.map((site) => site.trim())
			.filter((site) => site);

		const startTime = startInput.value;
		const endTime = endInput.value;

		console.log("Saving blocked sites:", sites);
		console.log("Saving start time:", startTime);
		console.log("Saving end time:", endTime);

		chrome.storage.local.set(
			{
				blockedSites: sites,
				startTime,
				endTime,
			},
			() => {
				status.textContent = "Settings saved!";
				setTimeout(() => (status.textContent = ""), 2000);
			}
		);
	});
});
