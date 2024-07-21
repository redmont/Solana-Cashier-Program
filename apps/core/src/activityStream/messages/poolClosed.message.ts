import { Injectable } from '@nestjs/common';
import { PoolClosedActivityEvent } from '../events/poolClosed.event';
import { MessageConverter } from './messageConverter';
import { md } from '../utils';

@Injectable()
export class PoolClosedMessage
  implements MessageConverter<PoolClosedActivityEvent>
{
  async convert() {
    return {
      message: md`
**Fight starting in 10s!** 🥊\n\nDetermining the biggest coin mover in 10, 9, 8… #LFB 📈
      `,
    };
  }
}
