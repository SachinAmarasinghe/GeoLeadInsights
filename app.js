let individualResults = [];
const resultsPerPage = 10; // Adjust as needed
let currentPage = 1;

async function findPostalCodes() {
    const input = document.getElementById("postalCodesInput").value;

    const lines = input.split(/\r?\n/);
    const postalCodes = lines.map(line =>
        line.trim().toUpperCase().replace(/\s+/g, '').substring(0, 3)
    );

    let postalFSAData = [];
    let loader = document.getElementById('loader');
    loader.style.display = 'block'; // Show loader

    try {
        const response = await fetch('transformed_postal_fsa.json'); // Adjust the path as necessary
        postalFSAData = await response.json();
    } catch (error) {
        console.error('Error loading postal data:', error);
        return;
    } finally {
        loader.style.display = 'none'; // Hide loader after fetching data
    }

    // Display individual results with pagination
    const individualResultsTable = document.getElementById('individualResultsTable');
    individualResultsTable.innerHTML = '<tr><th>Postal Code</th><th>City</th></tr>';



    let startIndex = (currentPage - 1) * resultsPerPage;
    let endIndex = startIndex + resultsPerPage;

    individualResults = []; // Initialize the individual results array

    postalCodes.forEach((code, index) => {
        const cityEntry = postalFSAData.find(entry => entry.Postal_FSA.includes(code.substring(0, 3)));
        individualResults.push({
            Code: code,
            City: cityEntry ? cityEntry.City_Name : "Not Found"
        });

        // Display individual results with pagination
        if (index >= startIndex && index < endIndex) {
            individualResultsTable.innerHTML += `<tr><td>${code}</td><td>${cityEntry ? cityEntry.City_Name : "Not Found"}</td></tr>`;
        }
    });

    // Count FSAs and Assign Cities
    const fsaCounts = {};

    postalCodes.forEach(code => {
        fsaCounts[code] = (fsaCounts[code] || 0) + 1;
    })

    const fsaCityCount = Object.keys(fsaCounts).map(code => {
        const cityEntry = postalFSAData.find(entry => entry.Postal_FSA.includes(code));
        if (!cityEntry) {
            return null;
        }
        return {
            FSA: code,
            City: cityEntry ? cityEntry.City_Name : "Not Found",
            Count: fsaCounts[code]
        };
    }).filter(entry => entry !== null);

    // Sort by Count Descending and Take Top 30
    const top30FSAs = fsaCityCount.sort((a, b) => b.Count - a.Count).slice(0, 30);

    // Display the table
    displayFSATable(top30FSAs);

    // Display the grouped city table
    displayGroupedCityTable();
}

function displayFSATable(topFSAs) {
    const resultsDiv = document.getElementById('fsaCountTable');
    const table = document.createElement('table');
    table.innerHTML = `<tr><th>FSA</th><th>City</th><th>Count</th></tr>`;

    topFSAs.forEach(({ FSA, City, Count }) => {
        const row = table.insertRow();
        row.innerHTML = `<td>${FSA}</td><td>${City}</td><td>${Count}</td>`;
    });

    // Clear previous results and display the new table
    resultsDiv.innerHTML = '';
    resultsDiv.appendChild(table);
}

function exportCSV() {
    const csvContent = "data:text/csv;charset=utf-8," + individualResults.map(row => Object.values(row).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "individual_results.csv");
    document.body.appendChild(link);
    link.click();
}

function changePage(change) {
    const totalPages = Math.ceil(individualResults.length / resultsPerPage);
    currentPage += change;

    if (currentPage < 1) {
        currentPage = 1;
    } else if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    let startIndex = (currentPage - 1) * resultsPerPage;
    let endIndex = startIndex + resultsPerPage;

    const individualResultsTable = document.getElementById('individualResultsTable');
    individualResultsTable.innerHTML = '<tr><th>Postal Code</th><th>City</th></tr>';
    for (let i = startIndex; i < endIndex && i < individualResults.length; i++) {
        const { Code, City } = individualResults[i];
        individualResultsTable.innerHTML += `<tr><td>${Code}</td><td>${City}</td></tr>`;
    }

    document.getElementById('currentPage').innerText = currentPage;
}

function displayGroupedCityTable() {
    const groupedCityTable = document.getElementById('groupedCityTable');
    groupedCityTable.innerHTML = '<tr><th>City</th><th>Postal Codes/FSAs</th><th>Count</th></tr>';

    const cityGroups = {};

    individualResults.forEach(({ City, Code }) => {
        cityGroups[City] = cityGroups[City] || { Codes: new Set(), Count: 0 };
        cityGroups[City].Codes.add(Code); // Use a Set to store unique postal codes
        cityGroups[City].Count++;
    });

    // Sort city groups by count in descending order
    const sortedCityGroups = Object.entries(cityGroups)
        .sort(([, a], [, b]) => b.Count - a.Count);

    for (const [city, { Codes, Count }] of sortedCityGroups) {
        groupedCityTable.innerHTML += `<tr><td>${city}</td><td>${[...Codes].join(', ')}</td><td>${Count}</td></tr>`;
    }
}