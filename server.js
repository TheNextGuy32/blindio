'use strict';

const express = require('express');
//const enrouten = require('express-enrouten');

const app = express();
const server = require('http').Server(app);
//const io = require('socket.io')(server);

app.use(express.static(`${__dirname}/client`));
app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/client/index.html`));
});

//app.use(enrouten({ directory: 'routes' }));

server.listen(Number(process.env.PORT || 5000));
console.log(`Listening on port ${process.env.PORT || 5000}`);

//const socketing = require('./socket.js');
//const game = require('./gameserver.js');
