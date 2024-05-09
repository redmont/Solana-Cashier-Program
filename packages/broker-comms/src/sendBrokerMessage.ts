import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, map, retry, timeout, timer } from 'rxjs';
import { BrokerMessage } from './brokerMessage';
import { BaseResponse } from './baseResponse';

export async function sendBrokerMessage<
  T extends BrokerMessage<TResponse>,
  TResponse extends BaseResponse,
>(clientProxy: ClientProxy, message: T): Promise<TResponse> {
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
      map((response) => {
        if (!response.success) {
          throw new Error(
            `Response not successful: ${JSON.stringify(response)}`,
          );
        }
        return response;
      }),
      catchError((error) => {
        throw new Error(error.message);
      }),
    ),
  );

  return response;
}
