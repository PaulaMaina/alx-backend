#!/usr/bin/yarn dev
import { createClient, print } from 'redis';

const client = createClient();

client.on('error', (err) => {
  console.log('Redis client not connected to the server:', err.toString());
});

const setHash = (hashName, field, value) => {
  client.HSET(hashName, field, value, print);
};

const displayHash = (hashName) => {
  client.HGETALL(hashName, (_error, res) => {
    console.log(res);
  });
};

function main() {
  const hashObject = {
    Portland: 50,
    Seattle: 80,
    'New York': 20,
    Bogota: 20,
    Cali: 40,
    Paris: 2,
  };
  for (const [field, value] of Object.entries(hashObject)) {
    setHash('HolbertonSchools', field, value);
  }
  displayHash('HolbertonSchools');
}

client.on('connect', () => {
  console.log('Redis client connected to the server');
  main();
});
