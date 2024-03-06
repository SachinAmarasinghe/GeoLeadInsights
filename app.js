async function findPostalCodes() {
    const input = document.getElementById("postalCodesInput").value;

    const lines = input.split(/\r?\n/);
    const postalCodes = lines.map(line => 
        line.toUpperCase()
            .replace(/\s+/g, '')
            .substring(0, 3)
    );

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = '';
    let postalFSAData = []

    try {
        const response = await fetch('transformed_postal_fsa.json'); // Adjust the path as necessary
        postalFSAData = await response.json();

        postalCodes.forEach(code => {
            const city = postalFSAData.find(entry => entry.Postal_FSA.includes(code.substring(0, 3)));
            if (city) {
                resultsDiv.innerHTML += `<tr><td>${code}</td><td>${city.City_Name}</td></tr>`;
            } else {
                resultsDiv.innerHTML += `<tr><td>${code}</td><td>Not Found</td></tr>`;
            }
        });
    } catch (error) {
        console.error('Error loading postal data:', error);
        resultsDiv.innerHTML = `<p>Error loading postal data. Please check console for details.</p>`;
    }

    // Count FSAs
    const fsaCounts = {};
    postalCodes.forEach(code => {
        const fsa = code.substring(0, 3).toUpperCase();
        fsaCounts[fsa] = (fsaCounts[fsa] || 0) + 1;
    });

    // Assign Cities and Prepare Data for Display
    const fsaCityCount = Object.keys(fsaCounts).map(fsa => {
        const cityEntry = postalFSAData.find(entry => entry.Postal_FSA.includes(fsa));
        return {
            FSA: fsa,
            City: cityEntry ? cityEntry.City_Name : "Unknown",
            Count: fsaCounts[fsa]
        };
    });

    // Sort by Count Descending and Take Top 30
    const top30FSAs = fsaCityCount.sort((a, b) => b.Count - a.Count).slice(0, 30);

    // Proceed to Step 3: Display the table
    displayFSATable(top30FSAs);
}

function displayFSATable(topFSAs) {
    const resultsDiv = document.getElementById('fsaCountTable'); // Assuming you have a div with id="results" in your HTML
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