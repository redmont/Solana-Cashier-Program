import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface BroadcastResponse {
  name: string;
  scope: string;
  serverAddress: string;
  region: string;
}

/**
 * Service for getting RTMP stream URLs from the transcoder
 */
@Injectable()
export class StreamUrlService {
  private readonly logger = new Logger(StreamUrlService.name);
  private readonly red5StreamManagerHostname: string;

  constructor(
    configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.red5StreamManagerHostname = configService.get<string>(
      'red5StreamManagerHostname',
    );
  }

  async getStreamUrl(streamId: string): Promise<string | null> {
    // Strip the numeric suffix from the stream ID (_1, _2, etc.)
    const strippedStreamId = streamId.replace(/_\d+$/, '');

    const response = await firstValueFrom(
      this.httpService.get<BroadcastResponse>(
        `https://${this.red5StreamManagerHostname}/streammanager/api/4.0/event/live/${strippedStreamId}?action=broadcast&transcode=true`,
      ),
    );

    if (response.status !== 200) {
      this.logger.warn(
        `Failed to get stream URL for stream '${strippedStreamId}'. Status code: ${response.status}`,
        response.data,
      );
      return null;
    }

    const { name, scope, serverAddress } = response.data;

    return `rtmp://${serverAddress}/${scope}/${streamId}`;
  }
}
