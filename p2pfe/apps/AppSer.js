const express = require('express');
const path = require('path');
const cors = require('cors'); // Import the cors middleware
const env = require('dotenv').config()

const app = express();
const port = process.env.PORT_TRACKER || 8000

app.use('/services', express.static(path.join(__dirname, '..',"services")));
app.use(cors())
app.use(express.json())

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '..','/pages/server.html'));
});

app.get('/config.js', function(req, res) {

  const scriptContent = `
    var tracker_port = ${process.env.TRACKER_SERVER_PORT};
  `;
  res.type('application/javascript').send(scriptContent);

});

app.listen(port, () => {
  console.log('Server started at http://localhost:' + port);
});
