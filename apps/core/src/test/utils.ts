export const waitForPromisesAndFakeTimers = async () => {
  do {
    jest.runAllTimers();
    await new Promise(jest.requireActual('timers').setImmediate);
  } while (jest.getTimerCount() > 0);
};
