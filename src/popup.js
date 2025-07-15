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
	const blockedSitesList = document.getElementById("blocked-sites-list");

	// Add current site to input
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		const hostname = new URL(tabs[0].url).hostname.replace(/^www\./, "");
		console.log("Current site:", hostname);
		addCurrentSiteInput.value = hostname;
		addCurrentSiteInput.disabled = true;
	});

	function addSiteToList(site, blockedSites) {
		const li = document.createElement("li");
		const div = document.createElement("div");
		const input = document.createElement("input");
		const button = document.createElement("button");

		div.classList.add("remove-site-container");
		input.type = "text";
		input.value = site;
		input.disabled = true;
		button.classList.add("remove-site");
		button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <title>close-thick</title>
      <path d="M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12L20 6.91Z"/>
    </svg>
  `;

		button.addEventListener("click", () => {
			const index = blockedSites.indexOf(site);
			if (index > -1) {
				blockedSites.splice(index, 1);
				sitesInput.value = blockedSites.join(", ");
				li.remove();
				status.textContent = "Site removed";
				setTimeout(() => (status.textContent = ""), 2000);
			}
		});

		li.appendChild(div);
		div.appendChild(input);
		div.appendChild(button);
		blockedSitesList.appendChild(li);
	}

	function siteAlreadyInList(site) {
		const inputs = blockedSitesList.querySelectorAll("input");
		for (const input of inputs) {
			if (input.value === site) {
				return true;
			}
		}
		return false;
	}

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
				if (!siteAlreadyInList(site)) {
					addSiteToList(site, blockedSites);
					status.textContent = "Site added";
					setTimeout(() => (status.textContent = ""), 2000);
				} else {
					status.textContent = "Site already in list";
					setTimeout(() => (status.textContent = ""), 2000);
				}
			}
		});
	});

	// Add all sites to list
	chrome.storage.local.get("blockedSites", (data) => {
		const blockedSites = data.blockedSites || [];

		// create li items for each sites
		blockedSites.forEach((element) => {
			addSiteToList(element, blockedSites);
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
