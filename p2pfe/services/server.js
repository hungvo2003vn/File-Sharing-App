// var tracker_port = process.env.TRACKER_SERVER_PORT;

//Start
async function fetchStartData(hostName, port) {
    
    var url = `http://127.0.0.1:${tracker_port}/start`;

    try {
        const result = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "host": hostName,
                "port": port
            })
        });

        const data = await result.json();
       
        const resultContainer = document.getElementById('start-result-container');

// Clear previous results
resultContainer.innerHTML = '';

if (data.status === 'error') {
    // Display error message with recommendation
    const rowsData = [{
        Status: data.status,
        Message: data.message,
        Recommend: data.recommend
    }];

    const table = createTable('danger', ['Status', 'Message', 'Recommend'], rowsData);
    resultContainer.appendChild(table);
} else {
    // Display success message
    const rowsData = [{
        Status: data.status,
        Message: data.message
    }];

    const table = createTable('success', ['Status', 'Message'], rowsData);
    resultContainer.appendChild(table);
}
function createTable(status, columns, rowsData) {
    const table = document.createElement('table');
    table.className = `table table-${status === 'success' ? 'success' : 'danger'} table-striped table-bordered`;

    const thead = document.createElement('thead');
    thead.className = 'table-dark';

    const headerRow = document.createElement('tr');
    columns.forEach(column => {
        const headerCell = document.createElement('th');
        headerCell.innerHTML = `<strong>${column}</strong>`;
        headerRow.appendChild(headerCell);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    rowsData.forEach(rowData => {
        const row = document.createElement('tr');
        columns.forEach(column => {
            const cell = document.createElement('td');
            cell.innerText = rowData[column];
            cell.style.textAlign = 'center'; // Set text alignment to center using inline CSS
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    if (status === 'error') {
        // Add a row for the recommendation when the status is 'error'
        const recommendRow = document.createElement('tr');
        const recommendCell = document.createElement('td');
        recommendCell.colSpan = columns.length; // Span the entire row
        recommendCell.innerHTML = `<strong>Recommend:</strong> ${rowsData[0].recommend}`;
        recommendRow.appendChild(recommendCell);
        tbody.appendChild(recommendRow);
    }

    return table;
}

  
    } catch (error) {
        throw error
    }
}

async function submitStartForm() {
    // Get input values
    const hostName = document.getElementById('inputStartHostName').value;
    const port = document.getElementById('inputStartPort').value;

    // Call the fetchData function with the input values
    await fetchStartData(hostName, port);
}

const startButton = document.getElementById('start-button');
startButton.addEventListener('click', async ()=> {
    await submitStartForm()
});



//Discover
async function fetchDiscoverData(address, port) {
    
    var url = `http://127.0.0.1:${tracker_port}/discover`;

    try {
        const result = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "host": address,
                "port": port
            })
        });

        const data = await result.json();
        console.log(data);
        const resultContainer = document.getElementById('discover-result-container');

// Clear previous results
resultContainer.innerHTML = '';

if (data.status === 'error') {
    // Display error message
    const table = createTable('danger', ['Status', 'Message'], [{ Status: data.status, Message: data.message }]);
    resultContainer.appendChild(table);
} else if (Object.keys(data.data).length === 0) {
    // Display when data is NULL
    const table = createTable('success', ['Status', 'Data'], [{ Status: data.status, Data: 'NULL' }]);
    resultContainer.appendChild(table);
} else {
    // Create a table with Status and Filename columns
    const keys = Object.keys(data.data);
    const filesTable = createFilesTable(keys, data.data);
    resultContainer.appendChild(filesTable);
}

function createTable(status, columns, rowsData) {
    const table = document.createElement('table');
    table.className = `table table-${status === 'success' ? 'success' : 'danger'} table-striped table-bordered`;

    const thead = document.createElement('thead');
    thead.className = 'table-dark';

    const headerRow = document.createElement('tr');
    columns.forEach(column => {
        const headerCell = document.createElement('th');
        headerCell.innerHTML = `<strong>${column}</strong>`;
        headerRow.appendChild(headerCell);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    rowsData.forEach(rowData => {
        const row = document.createElement('tr');
        columns.forEach(column => {
            const cell = document.createElement('td');
            cell.innerText = rowData[column];
            cell.style.textAlign = 'center'; // Set text alignment to center using inline CSS
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    return table;
}

function createFilesTable(keys, data) {
    const filesTable = document.createElement('table');
    filesTable.className = 'table table-info table-striped table-bordered';

    const thead = document.createElement('thead');
    thead.className = 'table-dark';

    const headerRow = document.createElement('tr');
    ['Status', 'Filename'].forEach(column => {
        const headerCell = document.createElement('th');
        headerCell.innerHTML = `<strong>${column}</strong>`;
        headerRow.appendChild(headerCell);
    });

    thead.appendChild(headerRow);
    filesTable.appendChild(thead);

    const tbody = document.createElement('tbody');

    keys.forEach(key => {
        const row = document.createElement('tr');

        // Set ID to each row
        const rowId = `${key}discover`; // Combine key and "discover" to form the ID
        row.id = rowId;

        // Status column
        const statusCell = document.createElement('td');
        statusCell.innerHTML = 'Success'; // Assuming success, you might want to modify based on your actual logic
        row.appendChild(statusCell);

        // Filename column
        const filenameCell = document.createElement('td');
        filenameCell.innerHTML = data[key].filename;
        row.appendChild(filenameCell);

        tbody.appendChild(row);
    });

    filesTable.appendChild(tbody);
    return filesTable;
}

  
    
    } catch (error) {
        throw error
    }
}
async function submitDiscoverForm() {
    // Get input values
    const address = document.getElementById('inputDiscoverAddress').value;
    const port = document.getElementById('inputDiscoverPort').value;

    // Call the fetchData function with the input values
    await fetchDiscoverData(address, port);

}

const discoverButton = document.getElementById('discover-button');
discoverButton.addEventListener('click', async ()=> {
    await submitDiscoverForm()
});



//Ping
async function fetchPingData(hostName, port) {
    
    var url = `http://127.0.0.1:${tracker_port}/ping`;

    try {
        const result = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "host": hostName,
                "port": port
            })
        });

        const data = await result.json();
       
        const resultContainer = document.getElementById('ping-result-container');

        resultContainer.innerHTML = '';

        if (data.status === 'error') {
            // Display error message with recommendation
            const rowsData = [{
                Status: data.status,
                Message: data.message,
            }];
        
            const table = createTable('danger', ['Status', 'Message'], rowsData);
            resultContainer.appendChild(table);
        } else {
            // Display success message
            const rowsData = [{
                Status: data.status,
                Message: data.message
            }];
        
            const table = createTable('success', ['Status', 'Message'], rowsData);
            resultContainer.appendChild(table);
        }
        function createTable(status, columns, rowsData) {
            const table = document.createElement('table');
            table.className = `table table-${status === 'success' ? 'success' : 'danger'} table-striped table-bordered`;
        
            const thead = document.createElement('thead');
            thead.className = 'table-dark';
        
            const headerRow = document.createElement('tr');
            columns.forEach(column => {
                const headerCell = document.createElement('th');
                headerCell.innerHTML = `<strong>${column}</strong>`;
                headerRow.appendChild(headerCell);
            });
        
            thead.appendChild(headerRow);
            table.appendChild(thead);
        
            const tbody = document.createElement('tbody');
        
            rowsData.forEach(rowData => {
                const row = document.createElement('tr');
                columns.forEach(column => {
                    const cell = document.createElement('td');
                    cell.innerText = rowData[column];
                    cell.style.textAlign = 'center'; // Set text alignment to center using inline CSS
                    row.appendChild(cell);
                });
                tbody.appendChild(row);
            });
        
            table.appendChild(tbody);
        
        
            return table;
        }
        
    } catch (error) {
        throw error
    }
}

async function submitPingForm() {
    // Get input values
    const hostName = document.getElementById('inputPingHostname').value;
    const port = document.getElementById('inputPingPort').value;

    // Call the fetchData function with the input values
    await fetchPingData(hostName, port);
}

const pingButton = document.getElementById('ping-button');
pingButton.addEventListener('click', async ()=> {
    await submitPingForm()
});



//List_files
async function fetchFilesData() {
    
    var url = `http://127.0.0.1:${tracker_port}/list_files`;

    try {
        const result = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        const data = await result.json();

        const resultContainer = document.getElementById('listfiles-result-container');

// Clear previous results
resultContainer.innerHTML = '';

if (data.status === 'error') {
    // Display error message
    const table = createTable('danger', ['Status', 'Message'], [{ Status: data.status, Message: data.message }]);
    resultContainer.appendChild(table);
} else if (Object.keys(data.data).length === 0) {
    // Display when data is NULL
    const table = createTable('success', ['Status', 'Data'], [{ Status: data.status, Data: 'NULL' }]);
    resultContainer.appendChild(table);
} else {
    // Create a table with Status and Filename columns
    const keys = Object.keys(data.data);
    const filesTable = createFilesTable(keys, data.data);
    resultContainer.appendChild(filesTable);
}

function createTable(status, columns, rowsData) {
    const table = document.createElement('table');
    table.className = `table table-${status === 'success' ? 'success' : 'danger'} table-striped table-bordered`;

    const thead = document.createElement('thead');
    thead.className = 'table-dark';

    const headerRow = document.createElement('tr');
    columns.forEach(column => {
        const headerCell = document.createElement('th');
        headerCell.innerHTML = `<strong>${column}</strong>`;
        headerRow.appendChild(headerCell);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    rowsData.forEach(rowData => {
        const row = document.createElement('tr');
        columns.forEach(column => {
            const cell = document.createElement('td');
            cell.innerHTML = rowData[column];
            cell.style.textAlign = 'center'; // Set text alignment to center using inline CSS
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    return table;
}

function createFilesTable(keys, data) {
    const filesTable = document.createElement('table');
    filesTable.className = 'table table-info table-striped table-bordered';

    const thead = document.createElement('thead');
    thead.className = 'table-dark';

    const headerRow = document.createElement('tr');
    ['Filename', 'Author IP', 'Author Port'].forEach(column => {
        const headerCell = document.createElement('th');
        headerCell.innerHTML = `<strong>${column}</strong>`;
        headerRow.appendChild(headerCell);
    });

    thead.appendChild(headerRow);
    filesTable.appendChild(thead);

    const tbody = document.createElement('tbody');

    keys.forEach(key => {
        const row = document.createElement('tr');

        // Set ID to each row
        const rowId = `${key}listfiles`; // Combine key and "listfiles" to form the ID
        row.id = rowId;

        // Filename column
        const filenameCell = document.createElement('td');
        filenameCell.innerHTML = data[key].filename;
        row.appendChild(filenameCell);

        // Author IP and Author Port columns
        const authorAddress = data[key].author_address;
        const authorIP = authorAddress[0];
        const authorPort = authorAddress[1];

        const authorIPCell = document.createElement('td');
        authorIPCell.innerHTML = authorIP;
        row.appendChild(authorIPCell);

        const authorPortCell = document.createElement('td');
        authorPortCell.innerHTML = authorPort;
        row.appendChild(authorPortCell);

        tbody.appendChild(row);
    });

    filesTable.appendChild(tbody);
    return filesTable;
}

    } catch (error) {
        throw error
    }
}
async function submitListFilesForm() {
    // Call the fetchData function with the input values
    await fetchFilesData();

}

const listfilesButton = document.getElementById('listfiles-button');
listfilesButton.addEventListener('click', async ()=> {
    await submitListFilesForm()
});



//List_peers
async function fetchPeersData() {
    
    var url = `http://127.0.0.1:${tracker_port}/list_peers`;

    try {
        const result = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        const data = await result.json();

        const resultContainer = document.getElementById('listpeers-result-container');

// Clear previous results
resultContainer.innerHTML = '';

if (data.status === 'error') {
    // Display error message
    const table = createTable('danger', ['Status', 'Message'], [{ Status: data.status, Message: data.message }]);
    resultContainer.appendChild(table);
} else if (Object.keys(data.data).length === 0) {
    // Display when data is NULL
    const table = createTable('success', ['Status', 'Data'], [{ Status: data.status, Data: 'NULL' }]);
    resultContainer.appendChild(table);
} else {
    // Create a table with Status, Peer IP, and Peer Port columns
    const keys = Object.keys(data.data);
    const peersTable = createPeersTable(keys, data.data);
    resultContainer.appendChild(peersTable);
}

function createTable(status, columns, rowsData) {
    const table = document.createElement('table');
    table.className = `table table-${status === 'success' ? 'success' : 'danger'} table-striped table-bordered`;

    const thead = document.createElement('thead');
    thead.className = 'table-dark';

    const headerRow = document.createElement('tr');
    columns.forEach(column => {
        const headerCell = document.createElement('th');
        headerCell.innerHTML = `<strong>${column}</strong>`;
        headerRow.appendChild(headerCell);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    rowsData.forEach(rowData => {
        const row = document.createElement('tr');
        columns.forEach(column => {
            const cell = document.createElement('td');
            cell.innerHTML = rowData[column];
            cell.style.textAlign = 'center'; // Set text alignment to center using inline CSS
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    return table;
}

function createPeersTable(keys, data) {
    const peersTable = document.createElement('table');
    peersTable.className = 'table table-info table-striped table-bordered';

    const thead = document.createElement('thead');
    thead.className = 'table-dark';

    const headerRow = document.createElement('tr');
    ['Peer IP', 'Peer Port'].forEach(column => {
        const headerCell = document.createElement('th');
        headerCell.innerHTML = `<strong>${column}</strong>`;
        headerRow.appendChild(headerCell);
    });

    thead.appendChild(headerRow);
    peersTable.appendChild(thead);

    const tbody = document.createElement('tbody');

    keys.forEach(key => {
        const row = document.createElement('tr');

        // Set ID to each row
        const rowId = `${key}listpeers`; // Combine key and "listpeers" to form the ID
        row.id = rowId;

        // Parse the JSON string to get the array
        const peerAddress = JSON.parse(data[key]);

        // Peer IP column
        const peerIPCell = document.createElement('td');
        peerIPCell.innerHTML = peerAddress[0];
        row.appendChild(peerIPCell);

        // Peer Port column
        const peerPortCell = document.createElement('td');
        peerPortCell.innerHTML = peerAddress[1];
        row.appendChild(peerPortCell);

        tbody.appendChild(row);
    });

    peersTable.appendChild(tbody);
    return peersTable;
}


    } catch (error) {
        throw error
    }
}
async function submitListPeersForm() {
    // Call the fetchData function with the input values
    await fetchPeersData();

}

const listpeersButton = document.getElementById('listpeers-button');
listpeersButton.addEventListener('click', async ()=> {
    await submitListPeersForm()
});



//List_chunk_info
async function fetchChunkData() {
    
    var url = `http://127.0.0.1:${tracker_port}/list_chunkinfo`;

    try {
        const result = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        const data = await result.json();

        const resultContainer = document.getElementById('listchunk-result-container');

resultContainer.innerHTML = '';

if (data.status === 'error') {
    const results = document.createElement('div');
    results.className = `result ${data.status}`;
    results.innerHTML = `<strong>Status:</strong> ${data.status} | <strong>Message:</strong> ${data.message}`;
    const messageContent = document.createElement('span');
    messageContent.id = 'messageContent';
    messageContent.innerText = data.message;
    results.appendChild(messageContent);
    resultContainer.appendChild(results);
} else if (Object.keys(data.data).length === 0) {
    const results = document.createElement('div');
    results.className = `result ${data.status}`;
    results.innerHTML = `<strong>Status:</strong> ${data.status} | <strong>Data:</strong> NULL`;
    resultContainer.appendChild(results);
} else {
    const keys = Object.keys(data.data);

    const chunkTable = createChunkTable(keys, data.data);
    resultContainer.appendChild(chunkTable);
}

function createChunkTable(keys, data) {
    const chunkTable = document.createElement('table');
    chunkTable.className = 'table table-info table-striped table-bordered';

    const thead = document.createElement('thead');
    thead.className = 'table-dark';

    const headerRow = document.createElement('tr');
    ['Filename', 'Address', 'Chunk Info'].forEach(column => {
        const headerCell = document.createElement('th');
        headerCell.innerHTML = `<strong>${column}</strong>`;
        headerRow.appendChild(headerCell);
    });

    thead.appendChild(headerRow);
    chunkTable.appendChild(thead);

    const tbody = document.createElement('tbody');

    keys.forEach(key => {
        const row = document.createElement('tr');

        // Filename column
        const filenameCell = document.createElement('td');
        const filename = key.split('_')[0]; // Extracting the filename from the key
        filenameCell.innerHTML = filename;
        row.appendChild(filenameCell);

        // Chunk Info column
        const chunkInfoKey = Object.keys(data[key])[0];
        const chunkInfo = data[key][chunkInfoKey];
        const chunkInfoCell = document.createElement('td');
        chunkInfoCell.innerHTML = chunkInfoKey; // Displaying the key instead of chunkInfoKey
        row.appendChild(chunkInfoCell);

        // Key column
        const keyCell = document.createElement('td');
        keyCell.innerHTML = formatChunkInfo(chunkInfo); // Displaying the formatted chunkInfo
        row.appendChild(keyCell);
        tbody.appendChild(row);
    });

    chunkTable.appendChild(tbody);
    return chunkTable;
}

function formatChunkInfo(chunkInfo) {
    // Set a limit for displaying chunk information
    const limit = 4;

    if (chunkInfo.length <= limit) {
        // If the chunk info is within the limit, display all
        return chunkInfo.join(', ');
    } else {
        // If the chunk info exceeds the limit, display the first few, ellipses, and the last one
        const displayInfo = chunkInfo.slice(0, limit).join(', ');
        const lastInfo = chunkInfo[chunkInfo.length - 1];
        return `${displayInfo}, ..., ${lastInfo}`;
    }
}


    
    } catch (error) {
        throw error
    }
}
async function submitListChunkForm() {
    // Call the fetchData function with the input values
    await fetchChunkData();

}

const listchunkButton = document.getElementById('listchunk-button');
listchunkButton.addEventListener('click', async ()=> {
    await submitListChunkForm()
});



//Exit
async function fetchExitData() {
    
    var url = `http://127.0.0.1:${tracker_port}/exit`;

    try {
        const result = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        const data = await result.json();
       
        const resultContainer = document.getElementById('exit-result-container');

        resultContainer.innerHTML = '';

        if (data.status === 'error') {
            // Display error message with recommendation
            const rowsData = [{
                Status: data.status,
                Message: data.message,
            }];
        
            const table = createTable('danger', ['Status', 'Message'], rowsData);
            resultContainer.appendChild(table);
        } else {
            // Display success message
            const rowsData = [{
                Status: data.status,
                Message: data.message
            }];
        
            const table = createTable('success', ['Status', 'Message'], rowsData);
            resultContainer.appendChild(table);
        }
        function createTable(status, columns, rowsData) {
            const table = document.createElement('table');
            table.className = `table table-${status === 'success' ? 'success' : 'danger'} table-striped table-bordered`;
        
            const thead = document.createElement('thead');
            thead.className = 'table-dark';
        
            const headerRow = document.createElement('tr');
            columns.forEach(column => {
                const headerCell = document.createElement('th');
                headerCell.innerHTML = `<strong>${column}</strong>`;
                headerRow.appendChild(headerCell);
            });
        
            thead.appendChild(headerRow);
            table.appendChild(thead);
        
            const tbody = document.createElement('tbody');
        
            rowsData.forEach(rowData => {
                const row = document.createElement('tr');
                columns.forEach(column => {
                    const cell = document.createElement('td');
                    cell.innerText = rowData[column];
                    cell.style.textAlign = 'center'; // Set text alignment to center using inline CSS
                    row.appendChild(cell);
                });
                tbody.appendChild(row);
            });
        
            table.appendChild(tbody);
        
        
            return table;
        }
        
  
    } catch (error) {
        throw error
    }
}

async function submitExitForm() {

    // Call the fetchData function with the input values
    await fetchExitData();
}

const exitButton = document.getElementById('exit-button');
exitButton.addEventListener('click', async ()=> {
    await submitExitForm()
});

