#!/usr/bin/yarn dev
import { Queue, Job } from 'kue';

const createPushNotificationsJobs = (jobs, queue) => {
  if (!(jobs instanceof Array)) {
    throw new Error ('Jobs is not an array');
  }
  for (const jobElem of jobs) {
    const job = queue.create('push_notification_code_3', jobElem);

    job
      .on('enqueue', () => {
        console.log('Notification job created:', job.id);
      })
      .on('complete', () => {
        console.log('Notification job', job.id, 'completed');
      })
      .on('failed', (error) => {
        console.log('Notification job', job.id, 'failed:', error.message || error.toString());
      })
      .on('progress', () => {
        console.log('Notification job', job.id, `${progress}% complete`);
      })
    job.save();
  }
};

export default createPushNotificationsJobs;
