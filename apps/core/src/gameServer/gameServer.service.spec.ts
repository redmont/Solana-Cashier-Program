import { Test } from '@nestjs/testing';
import { NatsJetStreamClientProxy } from '@nestjs-plugins/nestjs-nats-jetstream-transport';
import { GameServerService } from './gameServer.service';
import { GameServerConfigService } from '@/gameServerConfig/gameServerConfig.service';
import { GameServerCapabilitiesService } from '@/gameServerCapabilities/gameServerCapabilities.service';
import { GameServerGateway } from './gameServerGateway';
import { FightType } from './models/fightType';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { waitForPromisesAndFakeTimers } from '@/test/utils';
import { ResultAsync } from 'neverthrow';
import { StreamUrlService } from './streamUrl.service';
import { of } from 'rxjs';
import { ConfigService } from '@nestjs/config';

describe('GameServerService', () => {
  let service: GameServerService;

  const gameServerConfigService = {
    get: jest.fn().mockResolvedValue(undefined),
  };

  const gameServerCapabilitiesService = {
    register: jest.fn(),
  };

  const gameServerGateway = {
    sendMessageToServer: jest.fn().mockResolvedValue(undefined),
  };

  const eventEmitter = {};

  let configService = {
    get: jest.fn().mockReturnValue(''),
  };

  const clientProxy = {
    send: jest.fn().mockImplementation(() => {
      return of({});
    }),
  };

  const streamUrlService = {
    getStreamUrl: jest.fn().mockResolvedValue('some_stream_url'),
  };

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [
        {
          provide: EventEmitter2,
          useValue: eventEmitter,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: GameServerConfigService,
          useValue: gameServerConfigService,
        },
        {
          provide: GameServerCapabilitiesService,
          useValue: gameServerCapabilitiesService,
        },
        {
          provide: GameServerGateway,
          useValue: gameServerGateway,
        },
        {
          provide: NatsJetStreamClientProxy,
          useValue: clientProxy,
        },
        {
          provide: StreamUrlService,
          useValue: streamUrlService,
        },
        GameServerService,
      ],
    }).compile();

    service = app.get<GameServerService>(GameServerService);
  });

  const readyMessage = {
    type: 'ready',
    capabilities: {
      models: {
        head: [],
        torso: [],
        legs: [],
      },
      finishingMoves: [],
      levels: [],
    },
  };

  describe('sendMessage', () => {
    it('should send a message to the server', async () => {
      const resultPromise = service.sendMessage('test001', { type: 'test' });

      await waitForPromisesAndFakeTimers();

      const result = await resultPromise;

      expect(gameServerGateway.sendMessageToServer).toHaveBeenCalled();
    });
  });

  describe('allocateServerForMatch', () => {
    const matchParameters = {
      level: 'L_ProtoMap',
      startTime: '2021-01-01T00:00:00Z',
      fightType: FightType.MMA,
      fighters: [
        {
          id: 1,
          displayName: 'Doge',
          model: {
            head: 'head1',
            torso: '',
            legs: '',
          },
        },
        {
          id: 2,
          displayName: 'Pepe',
          model: {
            head: 'head1',
            torso: '',
            legs: '',
          },
        },
      ],
    };

    it('should return null if there are no available servers', async () => {
      const result = await service.allocateServerForMatch(
        'match1',
        matchParameters,
      );

      expect(result).toBeNull();
      expect(gameServerConfigService.get).not.toHaveBeenCalled();
    });

    it('should return null if there is no config for the server', async () => {
      await service.handleGameServerMessage('test001', readyMessage);

      const result = await service.allocateServerForMatch(
        'match1',
        matchParameters,
      );

      expect(result).toBeNull();
      expect(gameServerConfigService.get).toHaveBeenCalled();
    });

    it('should return null if the server is not enabled', async () => {
      gameServerConfigService.get.mockResolvedValueOnce({
        enabled: false,
      });

      await service.handleGameServerMessage('test001', readyMessage);

      const result = await service.allocateServerForMatch(
        'match1',
        matchParameters,
      );

      expect(result).toBeNull();
      expect(gameServerConfigService.get).toHaveBeenCalled();
    });

    it('should return null if the matchSetup message is not successfully sent to the server', async () => {
      gameServerConfigService.get.mockResolvedValueOnce({
        enabled: true,
      });

      jest
        .spyOn(service, 'sendMessage')
        .mockImplementationOnce(() =>
          ResultAsync.fromPromise<void, string>(
            Promise.reject('error'),
            (err: string) => err,
          ),
        );

      await service.handleGameServerMessage('test001', readyMessage);

      const resultPromise = service.allocateServerForMatch(
        'match1',
        matchParameters,
      );

      await waitForPromisesAndFakeTimers();

      const result = await resultPromise;

      expect(result).toBeNull();
    });

    it('should return server details if matchSetup message is successfully sent to the server', async () => {
      gameServerConfigService.get.mockResolvedValueOnce({
        enabled: true,
      });

      jest
        .spyOn(service, 'sendMessage')
        .mockImplementationOnce(() =>
          ResultAsync.fromPromise<void, string>(
            Promise.resolve(undefined),
            (err: string) => err,
          ),
        );

      await service.handleGameServerMessage('test001', readyMessage);

      const resultPromise = service.allocateServerForMatch(
        'match1',
        matchParameters,
      );

      await waitForPromisesAndFakeTimers();

      const result = await resultPromise;

      expect(result).toHaveProperty('serverId', 'test001');
      expect(result).toHaveProperty('capabilities', readyMessage.capabilities);
    });

    it('should return servers in a round-robin fashion', async () => {
      gameServerConfigService.get.mockResolvedValueOnce({
        enabled: true,
      });

      jest
        .spyOn(service, 'sendMessage')
        .mockImplementationOnce(() =>
          ResultAsync.fromPromise<void, string>(
            Promise.resolve(undefined),
            (err: string) => err,
          ),
        );

      await service.handleGameServerMessage('test001', readyMessage);

      service['lastUsedServerId'] = 'test001';

      await service.handleGameServerMessage('test002', readyMessage);
      await service.handleGameServerMessage('test003', readyMessage);

      const result1 = await service.allocateServerForMatch(
        'match1',
        matchParameters,
      );

      expect(result1).toHaveProperty('serverId', 'test002');
    });
  });

  describe('setOutcome', () => {
    it('should return an error if an FSM for the server is not found', async () => {
      const result = await service.setOutcome('test001', 'match1', [
        {
          id: 1,
          health: 100,
          finishingMove: 'punch',
        },
      ]);

      expect(result.isErr()).toBe(true);
    });

    it('should transition the FSM state even if sending outcome message to server fails', async () => {
      gameServerConfigService.get.mockResolvedValueOnce({
        enabled: true,
      });
      await service.handleGameServerMessage('test001', readyMessage);
      const fsmSend = service.gameServerFSMs.get('test001').send;
      jest
        .spyOn(service.gameServerFSMs.get('test001'), 'send')
        .mockImplementation((args) => {
          if (args.type !== 'RESET') {
            fsmSend(args);
          }
        });

      jest
        .spyOn(service, 'sendMessage')
        .mockImplementationOnce(() =>
          ResultAsync.fromPromise<void, string>(
            Promise.reject('error'),
            (err: string) => err,
          ),
        );

      const resultPromise = service.setOutcome('test001', 'match1', [
        {
          id: 1,
          health: 100,
          finishingMove: 'punch',
        },
      ]);

      await waitForPromisesAndFakeTimers();

      const result = await resultPromise;

      expect(result.isOk()).toBe(true);
    });
  });
});
