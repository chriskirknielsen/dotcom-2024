const years = {
	2026: {
		runs: 6,
		time: [8, 0, 37],
		distance: 69.2,
		elevation: 687,
	},
	2025: {
		runs: 25,
		time: [30, 6, 2],
		distance: 251.7,
		elevation: 3054,
	},
	2024: {
		runs: 39,
		time: [41, 46, 44],
		distance: 357,
		elevation: 3717,
	},
	2023: {
		runs: 90,
		time: [73, 29, 2],
		distance: 641.8,
		elevation: 10849,
	},
	2022: {
		runs: 24,
		time: [10, 23, 55],
		distance: 95.4,
		elevation: 1462,
	},
};

// Aggregate all the data!
let totals = { runs: 0, time: [0, 0, 0], timeSeconds: 0, distance: 0, elevation: 0 };
for (let y in years) {
	const data = years[y];
	data.timeSeconds = data.time[0] * 3600 + data.time[1] * 60 + data.time[0]; // Consolidate for easier calculation and sorting
	totals.runs += data.runs;
	totals.time[0] += data.time[0];
	totals.time[1] += data.time[1];
	totals.time[2] += data.time[2];
	totals.timeSeconds += data.timeSeconds;
	totals.distance += data.distance;
	totals.elevation += data.elevation;
}

// Convert seconds and minutes to minutes and hours if they are greater than 60
for (let i = 2; i >= 1; i--) {
	const overflowValue = Math.floor(totals.time[i] / 60);
	totals.time[i] %= 60;
	totals.time[i - 1] += overflowValue;
}

export default { totals, years };
