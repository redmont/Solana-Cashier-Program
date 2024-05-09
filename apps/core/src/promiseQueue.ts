export class PromiseQueue {
  private queue = [];
  private processing = false;

  constructor() {}

  // Add a new promise generator to the queue
  enqueue(promiseGenerator: () => Promise<void>) {
    this.queue.push(promiseGenerator);
    if (!this.processing) {
      this.dequeue(); // Start processing if not already doing so
    }
  }

  // Process the queue items sequentially
  async dequeue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    this.processing = true;

    const promiseGenerator = this.queue.shift();
    try {
      await promiseGenerator(); // Execute promise
    } catch (error) {
      console.error('Failed to process an item:', error);
    }

    this.processing = false;
    if (this.queue.length > 0) {
      this.dequeue(); // Continue processing the next item
    }
  }
}
