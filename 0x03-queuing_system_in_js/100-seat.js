#!/usr/bin/yarn dev
import express from 'express';
import { createClient } from 'redis';
import { createQueue } from 'kue';
import { promisify } from 'util';

const app = express();
const queue = createQueue();
const client = createClient({name: 'reserve_seat'});
const INITIAL_SEATS_COUNT = 50;
let reservationEnabled = false;

const reserveSeat = async (number) => {
  return promisify(client.SET).bind(client)('available_seats', number);
};

const getCurrentAvailableSeats = async () => {
  return promisify(client.GET).bind(client)('available_seats');
};

app.get('/available_seats', (_, response) => {
  getCurrentAvailableSeats().then((numberOfAvailableSeats) => {
    response.json({numberOfAvailableSeats});
  });
});

app.get('/reserve_seat', (_request, response) => {
  if (!reservationEnabled) {
    response.json({status: 'Reservation are blocked'});
    return;
  }
  try {
    const job = queue.create('reserve_seat');

    job.on('failed', (error) => {
      console.log('Seat reservation job', job.id, 'failed:', error.message || error.toString());
    });

    job.on('complete', () => {
      console.log('Seat reservation job', job.id, 'completed');
    });
    job.save();
    response.json({status: 'Reservation in process'});
  }
  catch {
    response.json({status: 'Reservation failed'});
  }
});

app.get('/process', (_request, response) => {
  response.json({status: 'Queue processing'});
  queue.process('reserve_seat', (_job, done) => {
    getCurrentAvailableSeats().then((res) => Number.parseInt(res || 0))
      .then((availableSeats) => {
        reservationEnabled = availableSeats <= 1 ? false : reservationEnabled;
        if (availableSeats >= 1) {
	  reserveSeat(availableSeats - 1).then(() => done());
	} else {
          done(new Error('Not enough seats available'));
	}
      });
  });
});

const resetAvailableSeats = async (initialSeatsCount) => {
  return promisify(client.SET)
    .bind(client)('available_seats', Number.parseInt(initialSeatsCount));
};

app.listen(1245, 'localhost', () => {
  resetAvailableSeats(process.env.INITIAL_SEATS_COUNT || INITIAL_SEATS_COUNT)
    .then(() => {
      reservationEnabled = true;
      console.log('Server runing on localhost port 1245');
    });
});
