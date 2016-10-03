const express = require('express');
var path = require('path');
// const enrouten = require('express-enrouten');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(express.static(path.resolve(`${__dirname}/../public`)));
app.get('/', (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../public/index.html`));
});

// app.use(enrouten({ directory: 'routes' }));

server.listen(Number(process.env.PORT || 5000));
console.log(`Listening on port ${process.env.PORT || 5000}`);

// const socketing = require('./socket.js');
// const game = require('./gameserver.js');
