import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { catchError, firstValueFrom, retry, timeout, timer } from 'rxjs';
import { BrokerMessage } from './brokerMessage';
import { BaseResponse } from './baseResponse';

export async function sendBrokerMessage<
  T extends BrokerMessage<TResponse>,
  TResponse extends BaseResponse,
>(clientProxy: NatsJetStreamClientProxy, message: T): Promise<TResponse> {
  const messageType = (message.constructor as any).messageType;

  const response = await firstValueFrom(
    clientProxy.send(messageType, message).pipe(
      timeout(30000),
      retry({
        count: 5,
        delay: (_error, retryIndex) => {
          const interval = 10_000;
          const delay = Math.pow(2, retryIndex - 1) * interval;
          return timer(delay);
        },
      }),
      catchError((error) => {
        throw new Error(error.message);
      }),
    ),
  );

  return response;
}

export async function sendBrokerCommand<
  T extends BrokerMessage<TResponse>,
  TResponse extends BaseResponse,
>(clientProxy: NatsJetStreamClientProxy, message: T): Promise<TResponse> {
  const messageType = (message.constructor as any).messageType;

  try {
    return await firstValueFrom(
      clientProxy.send<TResponse>({ cmd: messageType }, message),
    );
  } catch (error) {
    console.log(
      `Error in sendBrokerCommand sending message of type ${messageType}: `,
      JSON.stringify(message),
    );
    throw error;
  }
}
