#!/usr/bin/yarn dev
import { createQueue, Job } from 'kue';

const queue = createQueue();
const blacklist = ['4153518780', '4153518781'];

const sendNotification = (phoneNumber, message, job, done) => {
  let total = 2;
  let pending = 2;
  let sendingInterval = setInterval(() => {
    if (total - pending < total / 2) {
      job.progress(total - pending, total);
    }
    if (blacklist.includes(phoneNumber)) {
      done(new Error(`Phone number ${phoneNumber} is blacklisted`));
      clearInterval(sendingInterval);
      return;
    }
    if (total === pending) {
      console.log(`Sending notification to ${phoneNumber}, with message: ${message}`);
    }
    --pending || done();
    pending || clearInterval(sendingInterval);
  }, 1000);
};

queue.process('push_notification_code_2', 2, (job, done) => {
  sendNotification(job.data.phoneNumber,  job.data.message, job, done);
});
