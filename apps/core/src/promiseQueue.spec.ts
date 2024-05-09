import { PromiseQueue } from './promiseQueue';

describe('PromiseQueue', () => {
  it('should enqueue a promise generator and successfully process it', async () => {
    const promiseQueue = new PromiseQueue();
    let isProcessed = false;

    const promiseGenerator = () =>
      new Promise<void>((resolve) => {
        setTimeout(() => {
          isProcessed = true;
          resolve();
        }, 100);
      });

    promiseQueue.enqueue(promiseGenerator);

    expect(isProcessed).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(isProcessed).toBe(true);
  });

  it('should enqueue a promise generator while processing the queue and handle it correctly', async () => {
    const promiseQueue = new PromiseQueue();
    let isProcessed1 = false;
    let isProcessed2 = false;

    const promiseGenerator1 = () =>
      new Promise<void>((resolve) => {
        setTimeout(() => {
          isProcessed1 = true;
          resolve();
        }, 100);
      });

    const promiseGenerator2 = () =>
      new Promise<void>((resolve) => {
        setTimeout(() => {
          isProcessed2 = true;
          resolve();
        }, 200);
      });

    promiseQueue.enqueue(promiseGenerator1);

    expect(isProcessed1).toBe(false);
    expect(isProcessed2).toBe(false);

    promiseQueue.enqueue(promiseGenerator2);

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(isProcessed1).toBe(true);
    expect(isProcessed2).toBe(true);
  });

  it('should enqueue multiple promise generators and successfully process them sequentially', async () => {
    const promiseQueue = new PromiseQueue();
    let isProcessed1 = false;
    let isProcessed2 = false;
    let isProcessed3 = false;

    const promiseGenerator1 = () =>
      new Promise<void>((resolve) => {
        setTimeout(() => {
          isProcessed1 = true;
          resolve();
        }, 100);
      });

    const promiseGenerator2 = () =>
      new Promise<void>((resolve) => {
        setTimeout(() => {
          isProcessed2 = true;
          resolve();
        }, 200);
      });

    const promiseGenerator3 = () =>
      new Promise<void>((resolve) => {
        setTimeout(() => {
          isProcessed3 = true;
          resolve();
        }, 300);
      });

    promiseQueue.enqueue(promiseGenerator1);
    promiseQueue.enqueue(promiseGenerator2);
    promiseQueue.enqueue(promiseGenerator3);

    expect(isProcessed1).toBe(false);
    expect(isProcessed2).toBe(false);
    expect(isProcessed3).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(isProcessed1).toBe(true);
    expect(isProcessed2).toBe(true);
    expect(isProcessed3).toBe(true);
  });

  it('should enqueue promise generators with different execution times and successfully process them in the correct order', async () => {
    const promiseQueue = new PromiseQueue();
    let isProcessed1 = false;
    let isProcessed2 = false;
    let isProcessed3 = false;

    const promiseGenerator1 = () =>
      new Promise<void>((resolve) => {
        setTimeout(() => {
          isProcessed1 = true;
          resolve();
        }, 100);
      });

    const promiseGenerator2 = () =>
      new Promise<void>((resolve) => {
        setTimeout(() => {
          isProcessed2 = true;
          resolve();
        }, 200);
      });

    const promiseGenerator3 = () =>
      new Promise<void>((resolve) => {
        setTimeout(() => {
          isProcessed3 = true;
          resolve();
        }, 300);
      });

    promiseQueue.enqueue(promiseGenerator1);
    promiseQueue.enqueue(promiseGenerator2);
    promiseQueue.enqueue(promiseGenerator3);

    expect(isProcessed1).toBe(false);
    expect(isProcessed2).toBe(false);
    expect(isProcessed3).toBe(false);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(isProcessed1).toBe(true);
    expect(isProcessed2).toBe(true);
    expect(isProcessed3).toBe(true);
  });
});
