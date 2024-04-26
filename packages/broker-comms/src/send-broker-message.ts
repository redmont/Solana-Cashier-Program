import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, map, timeout } from 'rxjs';
import { BrokerMessage } from './broker-message';
import { BaseResponse } from './base-response';

export async function sendBrokerMessage<
  T extends BrokerMessage<TResponse>,
  TResponse extends BaseResponse,
>(clientProxy: ClientProxy, message: T): Promise<TResponse> {
  const messageType = (message.constructor as any).messageType;

  const response = await firstValueFrom(
    clientProxy.send(messageType, message).pipe(
      timeout(30000),
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
