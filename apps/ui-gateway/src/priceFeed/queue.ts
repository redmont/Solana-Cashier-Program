export class Queue<T> {
  private readonly queue: T[] = [];

  constructor(private readonly limit = 30) {}

  get size() {
    return this.queue.length;
  }

  get last() {
    return this.queue[this.queue.length - 1];
  }

  enqueue(item: T) {
    if (this.queue.length >= this.limit) {
      this.dequeue();
    }
    this.queue.push(item);
  }

  dequeue() {
    return this.queue.shift();
  }

  peek() {
    return this.queue[0];
  }

  isEmpty() {
    return this.queue.length === 0;
  }

  asArray() {
    return this.queue;
  }
}
