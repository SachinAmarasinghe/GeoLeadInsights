// ── CSV UPLOAD & DETECTION ──────────────────────────────────────

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    loadCSVFile(file);
    event.target.value = '';
}

function loadCSVFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const rows = parseCSV(e.target.result);
        if (!rows.length) return;

        const { columnIndex, hasHeader, columnName } = detectPostalColumn(rows);
        if (columnIndex === -1) {
            showDetectionBadge('⚠ No postal code column found — paste codes manually', false);
            return;
        }

        const codes = (hasHeader ? rows.slice(1) : rows)
            .map(r => (r[columnIndex] || '').trim())
            .filter(v => v.length > 0);

        document.getElementById('postalCodesInput').value = codes.join('\n');
        const label = columnName ? `"${columnName}"` : `column ${columnIndex + 1}`;
        showDetectionBadge(
            `Detected ${label} · <span class="badge-count">${codes.length} codes</span> loaded`,
            true
        );
    };
    reader.readAsText(file);
}

function parseCSV(text) {
    const rows = [];
    for (const line of text.split(/\r?\n/)) {
        if (!line.trim()) continue;
        const cells = [];
        let current = '', inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') { inQuotes = !inQuotes; }
            else if ((ch === ',' || ch === '\t') && !inQuotes) { cells.push(current.trim()); current = ''; }
            else { current += ch; }
        }
        cells.push(current.trim());
        rows.push(cells);
    }
    return rows;
}

function detectPostalColumn(rows) {
    const KEYWORDS  = ['postal', 'postcode', 'post_code', 'postalcode', 'zip', 'fsa', 'forward'];
    const FSA_RE    = /^[A-Za-z]\d[A-Za-z]/;
    const firstRow  = rows[0];
    const hasHeader = firstRow.some(c => /^[A-Za-z]/.test(c.trim()));

    if (hasHeader) {
        for (let i = 0; i < firstRow.length; i++) {
            const n = firstRow[i].toLowerCase().replace(/[\s_-]/g, '');
            if (KEYWORDS.some(kw => n.includes(kw)))
                return { columnIndex: i, hasHeader: true, columnName: firstRow[i] };
        }
    }

    const dataRows = hasHeader ? rows.slice(1) : rows;
    const numCols  = Math.max(...dataRows.map(r => r.length));
    let bestCol = -1, bestScore = 0;
    for (let col = 0; col < numCols; col++) {
        const vals  = dataRows.map(r => (r[col] || '').trim()).filter(v => v);
        if (!vals.length) continue;
        const score = vals.filter(v => FSA_RE.test(v)).length / vals.length;
        if (score > bestScore) { bestScore = score; bestCol = col; }
    }
    if (bestScore >= 0.3)
        return { columnIndex: bestCol, hasHeader, columnName: hasHeader ? firstRow[bestCol] : null };
    return { columnIndex: -1, hasHeader, columnName: null };
}

function showDetectionBadge(html, success) {
    const badge = document.getElementById('detectionBadge');
    document.getElementById('detectionMessage').innerHTML = html;
    badge.style.display     = 'flex';
    badge.style.borderColor = success ? 'rgba(0,207,168,.25)' : 'rgba(245,100,80,.25)';
    badge.style.color       = success ? 'var(--accent)'       : '#f56450';
    badge.style.background  = success ? 'var(--accent-dim)'   : 'rgba(245,100,80,.08)';
}

function dismissBadge() {
    document.getElementById('detectionBadge').style.display = 'none';
}

(function initDragDrop() {
    const zone = document.getElementById('uploadZone');
    if (!zone) return;
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    ['dragleave', 'dragend'].forEach(ev => zone.addEventListener(ev, () => zone.classList.remove('drag-over')));
    zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) loadCSVFile(file);
    });
})();

// ── PROVINCE & CLASSIFICATION ────────────────────────────────────

const PROVINCE_MAP = {
    A: { name: 'Newfoundland and Labrador', code: 'NL' },
    B: { name: 'Nova Scotia',               code: 'NS' },
    C: { name: 'Prince Edward Island',      code: 'PE' },
    E: { name: 'New Brunswick',             code: 'NB' },
    G: { name: 'Quebec',                    code: 'QC' },
    H: { name: 'Quebec',                    code: 'QC' },
    J: { name: 'Quebec',                    code: 'QC' },
    K: { name: 'Ontario',                   code: 'ON' },
    L: { name: 'Ontario',                   code: 'ON' },
    M: { name: 'Ontario',                   code: 'ON' },
    N: { name: 'Ontario',                   code: 'ON' },
    P: { name: 'Ontario',                   code: 'ON' },
    R: { name: 'Manitoba',                  code: 'MB' },
    S: { name: 'Saskatchewan',              code: 'SK' },
    T: { name: 'Alberta',                   code: 'AB' },
    V: { name: 'British Columbia',          code: 'BC' },
    X: { name: 'NWT / Nunavut',             code: 'NT' },
    Y: { name: 'Yukon',                     code: 'YT' },
};

function getProvince(fsa) {
    return PROVINCE_MAP[(fsa || '')[0]?.toUpperCase()] || { name: 'Unknown', code: '—' };
}

// Stats Canada: second character '0' = Rural Delivery
function getClassification(fsa) {
    if (!fsa || fsa.length < 2) return { label: '—', type: 'unknown' };
    return fsa[1] === '0' ? { label: 'Rural', type: 'rural' } : { label: 'Urban', type: 'urban' };
}

// Stats Canada 2021 Census metro area population tiers
const CITY_POP_TIER = {
    'Toronto':         { tier: 'High', range: '1M+' },
    'Etobicoke':       { tier: 'High', range: '1M+' },
    'Scarborough':     { tier: 'High', range: '1M+' },
    'North York':      { tier: 'High', range: '1M+' },
    'Montreal':        { tier: 'High', range: '1M+' },
    'Vancouver':       { tier: 'High', range: '1M+' },
    'Calgary':         { tier: 'High', range: '1M+' },
    'Edmonton':        { tier: 'High', range: '1M+' },
    'Ottawa':          { tier: 'High', range: '1M+' },
    'Mississauga':     { tier: 'High', range: '1M+' },
    'Brampton':        { tier: 'High', range: '500K+' },
    'Winnipeg':        { tier: 'High', range: '500K+' },
    'Quebec City':     { tier: 'High', range: '500K+' },
    'Hamilton':        { tier: 'Med',  range: '100K–500K' },
    'Kitchener':       { tier: 'Med',  range: '100K–500K' },
    'Waterloo':        { tier: 'Med',  range: '100K–500K' },
    'London':          { tier: 'Med',  range: '100K–500K' },
    'Halifax':         { tier: 'Med',  range: '100K–500K' },
    'Victoria':        { tier: 'Med',  range: '100K–500K' },
    'Oshawa':          { tier: 'Med',  range: '100K–500K' },
    'Windsor':         { tier: 'Med',  range: '100K–500K' },
    'Saskatoon':       { tier: 'Med',  range: '100K–500K' },
    'Regina':          { tier: 'Med',  range: '100K–500K' },
    'Kelowna':         { tier: 'Med',  range: '100K–500K' },
    'Abbotsford':      { tier: 'Med',  range: '100K–500K' },
    'Barrie':          { tier: 'Med',  range: '100K–500K' },
    'Sherbrooke':      { tier: 'Med',  range: '100K–500K' },
    'Guelph':          { tier: 'Med',  range: '100K–500K' },
    'Burnaby':         { tier: 'Med',  range: '100K–500K' },
    'Surrey':          { tier: 'Med',  range: '100K–500K' },
    'Richmond':        { tier: 'Med',  range: '100K–500K' },
    'Laval':           { tier: 'Med',  range: '100K–500K' },
    'Longueuil':       { tier: 'Med',  range: '100K–500K' },
    'Gatineau':        { tier: 'Med',  range: '100K–500K' },
    'Markham':         { tier: 'Med',  range: '100K–500K' },
    'Vaughan':         { tier: 'Med',  range: '100K–500K' },
    'Richmond Hill':   { tier: 'Med',  range: '100K–500K' },
    'Lévis':           { tier: 'Med',  range: '100K–500K' },
    'Saguenay':        { tier: 'Med',  range: '100K–500K' },
    'Trois-Rivières':  { tier: 'Med',  range: '100K–500K' },
    'Terrebonne':      { tier: 'Med',  range: '100K–500K' },
    'Nanaimo':         { tier: 'Low',  range: '<100K' },
    'Kamloops':        { tier: 'Low',  range: '<100K' },
    'Prince George':   { tier: 'Low',  range: '<100K' },
    'Lethbridge':      { tier: 'Low',  range: '<100K' },
    'Red Deer':        { tier: 'Low',  range: '<100K' },
    'Medicine Hat':    { tier: 'Low',  range: '<100K' },
    'Grande Prairie':  { tier: 'Low',  range: '<100K' },
    'Moose Jaw':       { tier: 'Low',  range: '<100K' },
    'Prince Albert':   { tier: 'Low',  range: '<100K' },
    'Peterborough':    { tier: 'Low',  range: '<100K' },
    'Kingston':        { tier: 'Low',  range: '<100K' },
    'Thunder Bay':     { tier: 'Low',  range: '<100K' },
    'Sudbury':         { tier: 'Low',  range: '<100K' },
    'Sault Ste. Marie':{ tier: 'Low',  range: '<100K' },
    'Moncton':         { tier: 'Low',  range: '<100K' },
    'Saint John':      { tier: 'Low',  range: '<100K' },
    'Fredericton':     { tier: 'Low',  range: '<100K' },
};

function getPopulationTier(cityName) {
    if (!cityName || cityName === 'Not Found') return { tier: '—', range: '—' };
    if (CITY_POP_TIER[cityName]) return CITY_POP_TIER[cityName];
    for (const [key, val] of Object.entries(CITY_POP_TIER)) {
        if (cityName.toLowerCase().includes(key.toLowerCase()) ||
            key.toLowerCase().includes(cityName.toLowerCase()))
            return val;
    }
    return { tier: 'Low', range: '<100K' };
}

// ── CITY COORDINATES (for map) ───────────────────────────────────

const CITY_COORDS = {
    'Toronto':         [43.6532, -79.3832],
    'Etobicoke':       [43.6205, -79.5132],
    'Scarborough':     [43.7731, -79.2578],
    'North York':      [43.7615, -79.4111],
    'Mississauga':     [43.5890, -79.6441],
    'Brampton':        [43.7315, -79.7624],
    'Markham':         [43.8561, -79.3370],
    'Vaughan':         [43.8563, -79.5085],
    'Richmond Hill':   [43.8828, -79.4403],
    'Barrie':          [44.3894, -79.6903],
    'Hamilton':        [43.2557, -79.8711],
    'Kitchener':       [43.4516, -80.4925],
    'Waterloo':        [43.4668, -80.5164],
    'Guelph':          [43.5448, -80.2482],
    'London':          [42.9849, -81.2453],
    'Windsor':         [42.3149, -83.0364],
    'Oshawa':          [43.8971, -78.8658],
    'Peterborough':    [44.3091, -78.3197],
    'Kingston':        [44.2312, -76.4860],
    'Ottawa':          [45.4215, -75.6972],
    'Gatineau':        [45.4765, -75.7013],
    'Thunder Bay':     [48.3809, -89.2477],
    'Sudbury':         [46.4917, -80.9930],
    'Sault Ste. Marie':[46.5136, -84.3358],
    'Montreal':        [45.5017, -73.5673],
    'Laval':           [45.5880, -73.7420],
    'Longueuil':       [45.5315, -73.5180],
    'Quebec City':     [46.8139, -71.2080],
    'Lévis':           [46.8030, -71.1780],
    'Sherbrooke':      [45.4042, -71.8929],
    'Saguenay':        [48.4280, -71.0680],
    'Trois-Rivières':  [46.3432, -72.5417],
    'Terrebonne':      [45.7050, -73.6380],
    'Winnipeg':        [49.8951, -97.1384],
    'Saskatoon':       [52.1332, -106.6700],
    'Regina':          [50.4452, -104.6189],
    'Moose Jaw':       [50.3934, -105.5519],
    'Prince Albert':   [53.2033, -105.7531],
    'Calgary':         [51.0447, -114.0719],
    'Edmonton':        [53.5461, -113.4938],
    'Red Deer':        [52.2681, -113.8112],
    'Lethbridge':      [49.6956, -112.8451],
    'Medicine Hat':    [50.0405, -110.6765],
    'Grande Prairie':  [55.1707, -118.7980],
    'Vancouver':       [49.2827, -123.1207],
    'Burnaby':         [49.2488, -122.9805],
    'Surrey':          [49.1913, -122.8490],
    'Richmond':        [49.1666, -123.1336],
    'Abbotsford':      [49.0504, -122.3045],
    'Kelowna':         [49.8880, -119.4960],
    'Kamloops':        [50.6745, -120.3273],
    'Nanaimo':         [49.1659, -123.9401],
    'Victoria':        [48.4284, -123.3656],
    'Prince George':   [53.9171, -122.7497],
    'Halifax':         [44.6488, -63.5752],
    'Moncton':         [46.0878, -64.7782],
    'Fredericton':     [45.9636, -66.6431],
    'Saint John':      [45.2733, -66.0633],
    'Charlottetown':   [46.2382, -63.1311],
    "St. John's":      [47.5615, -52.7126],
    'Whitehorse':      [60.7212, -135.0568],
    'Yellowknife':     [62.4540, -114.3718],
};

// ── BADGE RENDERERS ──────────────────────────────────────────────

function renderProvinceBadge(code) {
    return `<span class="tag tag-prov">${code}</span>`;
}

function renderClassBadge({ label, type }) {
    return `<span class="tag tag-${type}">${label}</span>`;
}

function renderPopBadge({ tier, range }) {
    const cls = tier === 'High' ? 'pop-high' : tier === 'Med' ? 'pop-med' : 'pop-low';
    return `<span class="tag ${cls}">${range}</span>`;
}

// ── STATE ────────────────────────────────────────────────────────

let individualResults = [];
const resultsPerPage  = 10;
let currentPage       = 1;
let sortedCityGroups  = [];
let top30FSAs         = [];
let cityFSATotals     = {};   // total FSA count per city from the full dataset
let leafletMap        = null;
let mapMarkers        = [];

// ── ANALYSIS ────────────────────────────────────────────────────

async function findPostalCodes() {
    const input = document.getElementById('postalCodesInput').value;
    const postalCodes = input.split(/\r?\n/)
        .map(line => line.trim().toUpperCase().replace(/\s+/g, '').substring(0, 3))
        .filter(code => code.length > 0);

    const loader         = document.getElementById('loader');
    const resultsShowDiv = document.getElementById('results');
    resultsShowDiv.style.display = 'none';
    loader.style.display = 'block';

    let postalFSAData = [];
    try {
        const response = await fetch('transformed_postal_fsa.json');
        postalFSAData  = await response.json();
    } catch (error) {
        console.error('Error loading postal data:', error);
        return;
    } finally {
        loader.style.display = 'none';
        resultsShowDiv.style.display = 'block';
    }

    // Build city → total FSA count from the full dataset (for coverage scores)
    cityFSATotals = {};
    postalFSAData.forEach(entry => {
        const city = entry.City_Name;
        cityFSATotals[city] = (cityFSATotals[city] || 0) + entry.Postal_FSA.length;
    });

    currentPage       = 1;
    individualResults = [];

    postalCodes.forEach(code => {
        const cityEntry = postalFSAData.find(e => e.Postal_FSA.includes(code.substring(0, 3)));
        const city      = cityEntry ? cityEntry.City_Name : 'Not Found';
        const province  = getProvince(code);
        const cls       = getClassification(code);
        const pop       = getPopulationTier(city);
        individualResults.push({ Code: code, City: city, Province: province.code, Classification: cls.label, Population: pop.range });
    });

    renderIndividualTable();

    // Top 30 FSAs
    const fsaCounts = {};
    postalCodes.forEach(code => { fsaCounts[code] = (fsaCounts[code] || 0) + 1; });

    top30FSAs = Object.keys(fsaCounts).map(code => {
        const cityEntry = postalFSAData.find(e => e.Postal_FSA.includes(code));
        if (!cityEntry) return null;
        const city     = cityEntry.City_Name;
        const province = getProvince(code);
        const cls      = getClassification(code);
        const pop      = getPopulationTier(city);
        return { FSA: code, City: city, Province: province.code, Classification: cls.label, Population: pop.range, Count: fsaCounts[code] };
    }).filter(Boolean).sort((a, b) => b.Count - a.Count).slice(0, 30);

    displayFSATable(top30FSAs);
    displayGroupedCityTable();
    renderCoverageCard();

    // Reset to table view on new analysis
    setView('table');
}

// ── DISPLAY ──────────────────────────────────────────────────────

function renderIndividualTable() {
    const start = (currentPage - 1) * resultsPerPage;
    const end   = start + resultsPerPage;
    const table = document.getElementById('individualResultsTable');

    table.innerHTML = `<tr>
        <th>Postal Code</th><th>City</th><th>Province</th>
        <th>Classification</th><th>Population</th>
    </tr>`;

    for (let i = start; i < end && i < individualResults.length; i++) {
        const { Code, City, Province } = individualResults[i];
        table.innerHTML += `<tr>
            <td>${Code}</td>
            <td>${City}</td>
            <td>${renderProvinceBadge(Province)}</td>
            <td>${renderClassBadge(getClassification(Code))}</td>
            <td>${renderPopBadge(getPopulationTier(City))}</td>
        </tr>`;
    }
}

function displayFSATable(topFSAs) {
    const container = document.getElementById('fsaCountTable');
    const table     = document.createElement('table');
    table.innerHTML = `<tr>
        <th>FSA</th><th>City</th><th>Province</th>
        <th>Classification</th><th>Population</th><th>Count</th>
    </tr>`;
    topFSAs.forEach(({ FSA, City, Province, Count }) => {
        const row = table.insertRow();
        row.innerHTML = `
            <td>${FSA}</td>
            <td>${City}</td>
            <td>${renderProvinceBadge(Province)}</td>
            <td>${renderClassBadge(getClassification(FSA))}</td>
            <td>${renderPopBadge(getPopulationTier(City))}</td>
            <td>${Count}</td>`;
    });
    container.innerHTML = '';
    container.appendChild(table);
}

function displayGroupedCityTable() {
    const table = document.getElementById('groupedCityTable');
    table.innerHTML = `<tr>
        <th>City</th><th>Province</th><th>Classification</th>
        <th>Population</th><th>Coverage</th><th>Postal Codes / FSAs</th><th>Count</th>
    </tr>`;

    const cityGroups    = {};
    const firstCodeByCity = {};
    individualResults.forEach(({ City, Code }) => {
        if (!firstCodeByCity[City]) firstCodeByCity[City] = Code;
        cityGroups[City] = cityGroups[City] || { Codes: new Set(), Count: 0 };
        cityGroups[City].Codes.add(Code);
        cityGroups[City].Count++;
    });

    sortedCityGroups = Object.entries(cityGroups)
        .sort(([, a], [, b]) => b.Count - a.Count)
        .map(([city, { Codes, Count }]) => {
            const fsa      = firstCodeByCity[city] || '';
            const province = getProvince(fsa);
            const cls      = getClassification(fsa);
            const pop      = getPopulationTier(city);
            const total    = cityFSATotals[city] || 0;
            const unique   = Codes.size;
            const coverage = total > 0 ? `${Math.round((unique / total) * 100)}%` : '—';
            return { City: city, Province: province.code, Classification: cls.label, Population: pop.range, Coverage: coverage, Codes: [...Codes].join(' '), Count };
        });

    for (const { City, Province, Codes, Count, Coverage } of sortedCityGroups) {
        const fsa = firstCodeByCity[City] || '';
        table.innerHTML += `<tr>
            <td>${City}</td>
            <td>${renderProvinceBadge(Province)}</td>
            <td>${renderClassBadge(getClassification(fsa))}</td>
            <td>${renderPopBadge(getPopulationTier(City))}</td>
            <td style="color:var(--accent);font-family:var(--font-data);font-size:.75rem;font-weight:600">${Coverage}</td>
            <td style="color:var(--text-sec);font-size:.72rem">${Codes}</td>
            <td>${Count}</td>
        </tr>`;
    }
}

// ── COVERAGE CARD ────────────────────────────────────────────────

function renderCoverageCard() {
    const totalLeads = individualResults.length;
    const provinces  = [...new Set(individualResults.map(r => r.Province).filter(p => p !== '—'))];

    // Per-city coverage, sorted by % desc
    const cityData = sortedCityGroups.map(({ City, Codes, Count }) => {
        const unique = Codes.split(' ').filter(Boolean).length;
        const total  = cityFSATotals[City] || 0;
        const pct    = total > 0 ? Math.round((unique / total) * 100) : null;
        return { City, Count, unique, total, pct };
    }).filter(c => c.pct !== null).sort((a, b) => b.pct - a.pct);

    const avgCov = cityData.length
        ? Math.round(cityData.reduce((s, c) => s + c.pct, 0) / cityData.length)
        : 0;

    document.getElementById('coverageSummaryStats').innerHTML = [
        ['Total Leads',  totalLeads],
        ['Cities',       sortedCityGroups.length],
        ['Provinces',    provinces.length],
        ['Avg Coverage', avgCov + '%'],
    ].map(([label, val]) => `
        <div class="cov-stat">
            <span class="cov-num">${val}</span>
            <span class="cov-label">${label}</span>
        </div>
    `).join('');

    document.getElementById('coverageBars').innerHTML = cityData.slice(0, 8).map(
        ({ City, unique, total, pct }) => `
        <div class="cov-row">
            <div class="cov-city">${City}</div>
            <div class="cov-track">
                <div class="cov-fill" data-pct="${pct}" style="width:0"></div>
            </div>
            <div class="cov-pct">${pct}%</div>
            <div class="cov-fsa">${unique}<span> / ${total}</span></div>
        </div>
    `).join('');

    document.getElementById('coverageCard').style.display = 'block';

    // Animate bars after paint
    requestAnimationFrame(() => requestAnimationFrame(() => {
        document.querySelectorAll('.cov-fill').forEach(el => {
            el.style.transition = 'width 0.9s cubic-bezier(0.4,0,0.2,1)';
            el.style.width = el.dataset.pct + '%';
        });
    }));
}

// ── MAP ──────────────────────────────────────────────────────────

function setView(view) {
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    document.getElementById('tableView').style.display = view === 'table' ? 'block' : 'none';
    document.getElementById('mapView').style.display   = view === 'map'   ? 'block' : 'none';

    if (view === 'map') {
        renderMap();
        // invalidateSize after the container becomes visible
        setTimeout(() => leafletMap && leafletMap.invalidateSize(), 120);
    }
}

function initMap() {
    if (leafletMap) return;
    leafletMap = L.map('mapContainer', { zoomControl: true }).setView([56.1304, -106.3468], 4);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, © <a href="https://carto.com">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
    }).addTo(leafletMap);
}

function renderMap() {
    initMap();

    // Clear previous markers
    mapMarkers.forEach(m => leafletMap.removeLayer(m));
    mapMarkers = [];

    if (!sortedCityGroups.length) return;

    const maxCount = Math.max(...sortedCityGroups.map(g => g.Count), 1);

    sortedCityGroups.forEach(({ City, Count, Province, Codes, Coverage }) => {
        const coords = CITY_COORDS[City];
        if (!coords) return;

        const pop    = getPopulationTier(City);
        const color  = pop.tier === 'High' ? '#f57060' : pop.tier === 'Med' ? '#f5a742' : '#00cfa8';
        const radius = Math.max(7, Math.sqrt(Count / maxCount) * 38);

        const circle = L.circleMarker(coords, {
            radius,
            fillColor:   color,
            color:       color,
            weight:      1.5,
            opacity:     0.85,
            fillOpacity: 0.25,
        });

        const popupHtml = `
            <div style="font-family:'IBM Plex Mono',monospace;padding:12px 14px;min-width:170px;background:#0f1620">
                <div style="font-size:.85rem;font-weight:700;color:${color};margin-bottom:.4rem">${City}</div>
                <div style="font-size:.68rem;color:#52718a;margin-bottom:.6rem;letter-spacing:.04em">${Province} · ${pop.range}</div>
                <div style="font-size:.75rem;color:#d8eaf4;display:flex;justify-content:space-between;gap:1rem">
                    <span>Leads</span><strong style="color:${color}">${Count}</strong>
                </div>
                ${Coverage !== '—' ? `
                <div style="font-size:.75rem;color:#d8eaf4;display:flex;justify-content:space-between;gap:1rem;margin-top:.25rem">
                    <span>Coverage</span><strong style="color:${color}">${Coverage}</strong>
                </div>
                <div style="margin-top:.6rem;height:3px;background:#1c2a3a;border-radius:2px">
                    <div style="height:100%;width:${Coverage};background:${color};border-radius:2px"></div>
                </div>` : ''}
            </div>`;

        circle.bindPopup(popupHtml, { maxWidth: 220 });
        circle.addTo(leafletMap);
        mapMarkers.push(circle);
    });

    if (mapMarkers.length) {
        leafletMap.fitBounds(L.featureGroup(mapMarkers).getBounds().pad(0.15));
    }
}

// ── PAGINATION ───────────────────────────────────────────────────

function changePage(change) {
    const totalPages = Math.ceil(individualResults.length / resultsPerPage);
    currentPage = Math.min(Math.max(currentPage + change, 1), totalPages);
    renderIndividualTable();
    document.getElementById('currentPage').innerText = currentPage;
}

// ── EXPORT ───────────────────────────────────────────────────────

function exportIndividual() { exportCSV(individualResults, 'geolead_individual.csv'); }
function exportTopThirty()  { exportCSV(top30FSAs,         'geolead_top30_fsas.csv'); }
function exportByCities()   { exportCSV(sortedCityGroups,  'geolead_by_city.csv'); }

function exportCSV(results, filename) {
    if (!results.length) return;
    const headers = Object.keys(results[0]).join(',');
    const rows    = results.map(row =>
        Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    );
    const uri  = 'data:text/csv;charset=utf-8,' + encodeURI([headers, ...rows].join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', uri);
    link.setAttribute('download', filename || 'geolead_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
