import { Injectable } from '@nestjs/common';
import { PoolClosedActivityEvent } from '../events/poolClosed.event';
import { MessageConverter } from './messageConverter';

@Injectable()
export class PoolClosedMessage
  implements MessageConverter<PoolClosedActivityEvent>
{
  async convert() {
    return {
      message: `**Fight starting in 10s!** 🥊  
  
Determining the biggest coin mover in 10, 9, 8… #LFB 📈`,
    };
  }
}
