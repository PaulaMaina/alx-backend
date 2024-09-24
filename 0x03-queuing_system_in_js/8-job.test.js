#!/usr/bin/yarn test
import { createQueue } from 'kue';
import { expect } from 'chai';
import sinon from 'sinon';
import createPushNotificationsJobs from './8-job.js';

describe('createPushNotificationsJobs', () => {
  const funcSpy = sinon.spy(console);
  const queue = createQueue({name: 'push_notification_code_test'});

  before(() => {
    queue.testMode.enter(true);
  });

  after(() => {
    queue.testMode.clear();
    queue.testMode.exit();
  });

  afterEach(() => {
    funcSpy.log.resetHistory();
  });

  it('displays an error message if jobs is not an array', () => {
    expect(
      createPushNotificationsJobs.bind(createPushNotificationsJobs, {}, queue)
    ).to.throw('Jobs is not an array');
  });

  it('adds jobs to the queue with the right type', (done) => {
    expect(queue.testMode.jobs.length).to.equal(0);
    const jobElems = [
      {
        phoneNumber: '4153538781',
        message: 'This is the code 4562 to verify your account'
      },
      {
        phoneNumber: '4153118782',
        message: 'This is the code 4321 to verify your account'
      },
    ];
    createPushNotificationsJobs(jobElems, queue);
    expect(queue.testMode.jobs.length).to.equal(2);
    expect(queue.testMode.jobs[0].data).to.deep.equal(jobElems[0]);
    expect(queue.testMode.jobs[0].type).to.equal('push_notification_code_3');
    queue.process('push_notification_code_3', () => {
      expect(
        funcSpy.log.calledWith('Notification job created:', queue.testMode.jobs[0].id)
      ).to.be.true;
    done();
    });
  });

  it('registers the progress event handler for the job', (done) => {
    queue.testMode.jobs[0].addListener('progress', () => {
      expect(
        funcSpy.log.calledWith('Notification job', queue.testMode.jobs[0].id, '25% complete')
      ).to.be.true;
      done();
    });
    queue.testMode.jobs[0].emit('progress', 25);
  });

  it('register the event handlet for a failed job', (done)=> {
    queue.testMode.jobs[0].addListener('failed', () => {
      expect(
        funcSpy.log.calledWith('Notification job', queue.testMode.jobs[0].id, 'failed:', 'Failed to send')
      ).to.be.true;
      done();
    });
    queue.testMode.jobs[0].emit('failed', new Error('Failed to send'));
  });

  it('registers the event handler for a complete job', (done) => {
    queue.testMode.jobs[0].addListener('complete', () => {
      expect(
        funcSpy.log.calledWith('Notification job', queue.testMode.jobs[0].id, 'completed')
      ).to.be.true;
      done();
    });
    queue.testMode.jobs[0].emit('complete');
  });
});
