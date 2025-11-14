let individualResults = [];
const resultsPerPage = 10; // Adjust as needed
let currentPage = 1;
let sortedCityGroups = [];
let top30FSAs = [];

async function getPostalCodeInputs() {
  const input = document.getElementById("postalCodesInput").value;
  const lines = input.split(/\r?\n/);
  const postalCodes = lines.map((line) =>
    line.trim().toUpperCase().replace(/\s+/g, "").substring(0, 3)
  );
  return postalCodes;
}

async function getCity(fsa) {
  try {
    const response = await fetch(
      `https://api.zippopotam.us/CA/${fsa.substring(0, 3)}`
    );

    if (!response.ok) {
      return "Unknown";
    }

    const data = await response.json();
    const place = data.places?.[0];
    const city = place?.["place name"] || "Unknown";
    return city;
  } catch (error) {
    console.log("API Function Error : ", error);
    return;
  }
}

async function getTopThirty() {
  const postalCodesFromInput = await getPostalCodeInputs();
  const fsaCounts = {};
  postalCodesFromInput.forEach((code) => {
    fsaCounts[code] = (fsaCounts[code] || 0) + 1;
  });

  const sortedEntries = Object.entries(fsaCounts)
    .sort(([, aCount], [, bCount]) => bCount - aCount)
    .slice(0, 30);

  const result = await Promise.all(
    sortedEntries.map(async ([code, count]) => {
      let city = "Unknown";
      try {
        city = await getCity(code);
      } catch (err) {
        console.warn(`Failed to fetch city for ${code}:`, err);
      }
      return { city, fsa: code, count };
    })
  );

  const top30 = result.filter((r) => r.city !== "Unknown");

  return top30;
}

async function getFSAData() {
  const topthirtyData = await getTopThirty();
  displayFSATable(topthirtyData);
}

function displayFSATable(topFSAs) {
  const resultsDiv = document.getElementById("fsaCountTable");
  const table = document.createElement("table");
  table.innerHTML = `<tr><th>FSA</th><th>City</th><th>Count</th></tr>`;

  topFSAs.forEach(({ city, fsa, count }) => {
    const row = table.insertRow();
    row.innerHTML = `<td>${fsa}</td><td>${city}</td><td>${count}</td>`;
  });

  // Clear previous results and display the new table
  resultsDiv.innerHTML = "";
  resultsDiv.appendChild(table);
}

function exportIndividual() {
  exportCSV(individualResults);
}

function exportTopThirty() {
  exportCSV(top30FSAs);
}

function exportByCities() {
  exportCSV(sortedCityGroups);
}

function exportCSV(results) {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    results.map((row) => Object.values(row).join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "individual_results.csv");
  document.body.appendChild(link);
  link.click();
}

function displayGroupedCityTable() {
  const groupedCityTable = document.getElementById("groupedCityTable");
  groupedCityTable.innerHTML =
    "<tr><th>City</th><th>Postal Codes/FSAs</th><th>Count</th></tr>";

  const cityGroups = {};

  individualResults.forEach(({ City, Code }) => {
    cityGroups[City] = cityGroups[City] || { Codes: new Set(), Count: 0 };
    cityGroups[City].Codes.add(Code); // Use a Set to store unique postal codes
    cityGroups[City].Count++;
  });

  // Sort city groups by count in descending order
  sortedCityGroups = [];
  sortedCityGroups = Object.entries(cityGroups).sort(
    ([, a], [, b]) => b.Count - a.Count
  );

  for (const [city, { Codes, Count }] of sortedCityGroups) {
    groupedCityTable.innerHTML += `<tr><td>${city}</td><td>${[...Codes].join(
      ", "
    )}</td><td>${Count}</td></tr>`;
  }
}
