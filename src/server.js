const express = require('express');
const path = require('path');
const redis = require('redis');

var redisClient = redis.createClient();

redisClient.on('connect', function(err) {
  if (err) {
    console.log(err);
    throw err;
  }
    console.log('Connected to Redis server.');

    const app = express();
  const server = require('http').Server(app);
  const io = require('./gameserver.js').listen(server);

  app.use(express.static(path.resolve(`${__dirname}/../public`)));
  app.get('/', (req, res) => {
    res.sendFile(path.resolve(`${__dirname}/../public/index.html`));
  });

  server.listen(Number(process.env.PORT || 5000));
  console.log(`**************************`);
  console.log(`* Listening on port ${process.env.PORT || 5000} *`);
  console.log(`**************************`);
});

