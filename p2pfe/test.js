var tracker_port = '58440';
var url = `http://localhost:${tracker_port}/start`;
url = 'http://127.0.0.1:58034/start'

async function fetchData() {
    try {
        const result = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({}) // Corrected from `jsonify({})` to `JSON.stringify({})`
        });


        const data = await result.json();
        console.log(data);
        if(data.status === 'error') {console.error(data.message)}
    } catch (error) {
        console.error('Error:', error);
    }
}

fetchData();
