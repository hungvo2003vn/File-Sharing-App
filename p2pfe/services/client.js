// var peer_port = process.env.PEER_SERVER_PORT

//Connect
async function fetchConnectData(hostName, port) {
    
    var url = `http://127.0.0.1:${peer_port}/connect`;

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
       
        const resultContainer = document.getElementById('connect-result-container');

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

async function submitConnectForm() {
    // Get input values
    const hostName = document.getElementById('inputConnectHostName').value;
    const port = document.getElementById('inputConnectPort').value;

    // Call the fetchData function with the input values
    await fetchConnectData(hostName, port);
}

const connectButton = document.getElementById('connect-button');
connectButton.addEventListener('click', async ()=> {
    await submitConnectForm()
});



//Discover
async function fetchDiscoverData(address, port) {
    
    var url = `http://127.0.0.1:${peer_port}/discover`;

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
    const filesTable = createFetchTable(keys, data.data);
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

function createFetchTable(keys, data) {
    const fetchTable = document.createElement('table');
    fetchTable.className = 'table table-info table-striped table-bordered';

    const thead = document.createElement('thead');
    thead.className = 'table-dark';

    const headerRow = document.createElement('tr');
    ['Status', 'Filename', 'Fetch'].forEach(column => {
        const headerCell = document.createElement('th');
        headerCell.innerHTML = `<strong>${column}</strong>`;
        headerRow.appendChild(headerCell);
    });

    thead.appendChild(headerRow);
    fetchTable.appendChild(thead);

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

        // Fetch column
        const fetchCell = document.createElement('td');
        const fetchButton = document.createElement('button');
        fetchButton.className = 'rounded'; // Add the 'rounded' class
        fetchButton.innerHTML = '<i class="bi-download"></i>'; // Bootstrap download icon

        // Assign the row ID as a data attribute to the fetch button
        fetchButton.dataset.rowId = rowId;

        fetchButton.addEventListener('click', () => {
            // Get the filename, author IP, and author port
            const filename = data[key].filename;
            const authorAddress = data[key].author_address;
            const authorIP = authorAddress[0];
            const authorPort = authorAddress[1];
        
            // Call the fetchData function with the obtained values
            fetchFetchData(filename, authorIP, authorPort);
        });

        fetchCell.appendChild(fetchButton);
        row.appendChild(fetchCell);

        tbody.appendChild(row);
    });

    fetchTable.appendChild(tbody);
    return fetchTable;
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



//List_files
async function fetchFilesData() {
    
    var url = `http://127.0.0.1:${peer_port}/list_files`;

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
    // Create a fetch table for the last else condition
    const keys = Object.keys(data.data);
    const fetchTable = createFetchTable(keys, data.data);
    resultContainer.appendChild(fetchTable);
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
            cell.style.textAlign = 'left'; // Set text alignment to left using inline CSS
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    return table;
}

function createFetchTable(keys, data) {
    const fetchTable = document.createElement('table');
    fetchTable.className = 'table table-info table-striped table-bordered';

    const thead = document.createElement('thead');
    thead.className = 'table-dark';

    const headerRow = document.createElement('tr');
    ['Filename', 'Author IP', 'Author Port', 'Fetch'].forEach(column => {
        const headerCell = document.createElement('th');
        headerCell.innerHTML = `<strong>${column}</strong>`;
        headerRow.appendChild(headerCell);
    });

    thead.appendChild(headerRow);
    fetchTable.appendChild(thead);

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

        // Fetch column
        const fetchCell = document.createElement('td');
        const fetchButton = document.createElement('button');
        fetchButton.className = 'rounded'; // Add the 'rounded' class
        fetchButton.innerHTML = '<i class="bi-download"></i>'; // Bootstrap download icon

        // Assign the row ID as a data attribute to the fetch button
        fetchButton.dataset.rowId = rowId;

        fetchButton.addEventListener('click', () => {
            // Get the filename, author IP, and author port
            const filename = data[key].filename;
            const authorAddress = data[key].author_address;
            const authorIP = authorAddress[0];
            const authorPort = authorAddress[1];
        
            // Call the fetchData function with the obtained values
            fetchFetchData(filename, authorIP, authorPort);
        });

        fetchCell.appendChild(fetchButton);
        row.appendChild(fetchCell);

        tbody.appendChild(row);
    });

    fetchTable.appendChild(tbody);
    return fetchTable;
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
//Fetch
async function fetchFetchData(filename, authorIP, authorPort) {
    
    var url = `http://127.0.0.1:${peer_port}/fetch`;

    try {
        const result = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "fname": filename,
                "destination": `p2pfs\\repo\\${filename}`,
                "peer_ip": authorIP,
                "peer_port": authorPort
            })
        });

        const data = await result.json();
        if (data.status === 'success') {
            showAlert('Success', data.message, 'success');
        } else {
            showAlert('Failure', data.message, 'danger');
        }
//         const resultContainer = document.getElementById('fetch-result-container');

//         resultContainer.innerHTML = '';

//         const results = document.createElement('div');
//         results.className = `result ${data.status}`;
//         results.innerHTML = `<strong>Status:</strong> ${data.status} | <strong>Message:</strong> `;
//         const messageContent = document.createElement('span');
//         messageContent.id = 'messageContent';
//         messageContent.innerText = data.message;
//         results.appendChild(messageContent);

//   resultContainer.appendChild(results);
function showAlert(title, message, type) {
    // Create an alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;

    // Add a close button to the alert
    alert.innerHTML = `
        <strong>${title}:</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Style the alert to center it on the screen
    alert.style.position = 'fixed';
    alert.style.top = '50%';
    alert.style.left = '50%';
    alert.style.transform = 'translate(-50%, -50%)';

    // Append the alert to the body
    document.body.appendChild(alert);

    // Use Bootstrap's alert dismissal functionality
    const alertInstance = new bootstrap.Alert(alert);

    // Remove the alert after a certain time (e.g., 5 seconds)
    setTimeout(() => {
        alertInstance.close();
    }, 5000);
}

    } catch (error) {
        throw error
    }
}



//Publish
async function fetchPublishData(lname, fname) {
    
    var url = `http://127.0.0.1:${peer_port}/publish`;

    try {
        const result = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "lname": lname,
                "fname": fname
            })
        });

        const data = await result.json();
       
        const resultContainer = document.getElementById('publish-result-container');

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

async function submitPublishForm() {
    // Get input values
    const lname = document.getElementById('inputLName').value;
    const fname = document.getElementById('inputpublishFName').value;

    // Call the fetchData function with the input values
    await fetchPublishData(lname, fname);
}

const publishButton = document.getElementById('publish-button');
publishButton.addEventListener('click', async ()=> {
    await submitPublishForm()
});



// //Fetch
// async function fetchFetchData(fname, destination, hostName, port) {
    
//     var url = `http://127.0.0.1:${peer_port}/fetch`;

//     try {
//         const result = await fetch(url, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 "fname": fname,
//                 "destination": destination,
//                 "peer_ip": hostName,
//                 "peer_port": port
//             })
//         });

//         const data = await result.json();
       
//         const resultContainer = document.getElementById('fetch-result-container');

//         resultContainer.innerHTML = '';

//         if (data.status === 'error') {
//             // Display error message with recommendation
//             const rowsData = [{
//                 Status: data.status,
//                 Message: data.message,
//             }];
        
//             const table = createTable('danger', ['Status', 'Message'], rowsData);
//             resultContainer.appendChild(table);
//         } else {
//             // Display success message
//             const rowsData = [{
//                 Status: data.status,
//                 Message: data.message
//             }];
        
//             const table = createTable('success', ['Status', 'Message'], rowsData);
//             resultContainer.appendChild(table);
//         }
//         function createTable(status, columns, rowsData) {
//             const table = document.createElement('table');
//             table.className = `table table-${status === 'success' ? 'success' : 'danger'} table-striped table-bordered`;
        
//             const thead = document.createElement('thead');
//             thead.className = 'table-dark';
        
//             const headerRow = document.createElement('tr');
//             columns.forEach(column => {
//                 const headerCell = document.createElement('th');
//                 headerCell.innerHTML = `<strong>${column}</strong>`;
//                 headerRow.appendChild(headerCell);
//             });
        
//             thead.appendChild(headerRow);
//             table.appendChild(thead);
        
//             const tbody = document.createElement('tbody');
        
//             rowsData.forEach(rowData => {
//                 const row = document.createElement('tr');
//                 columns.forEach(column => {
//                     const cell = document.createElement('td');
//                     cell.innerText = rowData[column];
//                     cell.style.textAlign = 'center'; // Set text alignment to center using inline CSS
//                     row.appendChild(cell);
//                 });
//                 tbody.appendChild(row);
//             });
        
//             table.appendChild(tbody);
        
        
//             return table;
//         }
        
  
//     } catch (error) {
//         throw error
//     }
// }

// async function submitFetchForm() {
//     // Get input values
//     const fname = document.getElementById('inputfetchFname').value;
//     const destination = document.getElementById('inputdestination').value;
//     const hostName = document.getElementById('inputfetchHostName').value;
//     const port = document.getElementById('inputfetchPort').value;

//     // Call the fetchData function with the input values
//     await fetchFetchData(fname, destination, hostName, port);
// }

// const fetchButton = document.getElementById('fetch-button');
// fetchButton.addEventListener('click', async ()=> {
//     await submitFetchForm()
// });




//Set delay
async function fetchDelayData(delay) {
    
    var url = `http://127.0.0.1:${peer_port}/set_delay`;

    try {
        const result = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "delay": delay
            })
        });

        const data = await result.json();
       
        const resultContainer = document.getElementById('delay-result-container');

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

async function submitDelayForm() {
    // Get input values
    const delay = document.getElementById('delay').value;

    // Call the fetchData function with the input values
    await fetchDelayData(delay);
}

const delayButton = document.getElementById('delay-button');
delayButton.addEventListener('click', async ()=> {
    await submitDelayForm()
});




//Exit
async function fetchExitData() {
    
    var url = `http://127.0.0.1:${peer_port}/exit`;

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