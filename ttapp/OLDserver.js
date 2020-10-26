
/**
 * Module dependencies.
 */

// const app = require('../app');
const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const parser = require('body-parser');
const debug = require('debug')('tmp:server');

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3002');

var app = express();
app.use(cors());
app.use(parser.json());
app.use(express.static(path.join(__dirname, 'build')))


app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/build/index.html'));
});
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

const { CredentialsServiceClient, Credentials } = require("@trinsic/service-clients");
require('dotenv').config();
const client = new CredentialsServiceClient(
    new Credentials(process.env.ACCESSTOK),
    { noRetryPolicy: true });

const cache = require('./model');
const ngrok = require('ngrok');

server.listen(port, async function () {
  const url_val = await ngrok.connect(port);
  console.log("============= \n\n" + url_val + "\n\n =========");
  let response = await client.createWebhook({
    url: url_val + "/webhook",  // process.env.NGROK_URL
    type: "Notification"
  });
  cache.add("webhookId", response.id);
  console.log('Listening on port %d', server.address().port);
});
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  let addr = server.address();
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}


