'use client';

import Image from 'next/image';
import styles from './page.module.css';
import {
  Button,
  Box,
  Center,
  Container,
  Grid,
  GridItem,
  HStack,
  SimpleGrid,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  Heading,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';

import { DateTime } from 'luxon';
import { ConnectKitButton } from 'connectkit';
import { motion, useAnimation } from 'framer-motion';
import {
  PlaceBetMessage,
  GetBalanceMessage,
  GetMatchStatusMessage,
  BetPlacedEvent,
  MatchUpdatedEvent,
  Message,
  GatewayEvent,
  BalanceUpdatedEvent,
  ActivityStreamEvent,
} from 'ui-gateway-messages';
import { sendMessage, socket } from '../socket';
import { FighterSelector } from '../components/FighterSelector';
import { useAuth } from '../components/AuthContextProvider';
import { shortenWalletAddress } from '../utils';

const series = 'frogs-vs-dogs-1';

export default function Page(): JSX.Element {
  const toast = useToast();
  const controls = useAnimation();
  const { tokenIsValid, authenticate, authToken } = useAuth();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [balance, setBalance] = useState(0);

  const [fighter, setFighter] = useState('');
  const [isWebSocketConnected, setWebSocketConnected] = useState(false);
  const [transport, setTransport] = useState('N/A');
  const [matchStatus, setMatchStatus] = useState<
    'pending' | 'bets' | 'started' | 'completed'
  >('pending');
  const [betAmount, setBetAmount] = useState(20);
  const [bets, setBets] = useState<
    { walletAddress: string; amount: number; fighter: string }[]
  >([]);
  const [startTime, setStartTime] = useState<DateTime | undefined>();
  const [winner, setWinner] = useState('');
  const [startsIn, setStartsIn] = useState('');
  const [activityStream, setActivityStream] = useState<
    { message: string; timestamp: string }[]
  >([]);

  useEffect(() => {
    setIsAuthenticated(tokenIsValid);

    if (tokenIsValid) {
      socket.auth = { token: authToken };
      socket.disconnect().connect();
    }
  }, [tokenIsValid]);

  // Every  second, update startsIn from startTime
  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        const diff = startTime.diffNow();
        setStartsIn(diff.toFormat('m:ss'));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [startTime]);

  async function subscribeAndGet<
    TSubscribe extends GatewayEvent,
    TGet extends Message,
  >({
    subscribe,
    get,
  }: {
    subscribe: {
      eventType: string;
      handler: (data: TSubscribe) => Promise<void>;
    };
    get: {
      message: TGet;
      handler: (data: TGet) => Promise<void>;
    };
  }) {
    const buffer: TSubscribe[] = [];

    const bufferHandler = async (data: TSubscribe) => {
      buffer.push(data);
    };

    socket.on(subscribe.eventType, bufferHandler);

    const response = await sendMessage(socket, get.message);

    await get.handler(response);

    socket.off(subscribe.eventType, bufferHandler);

    const lastTimestamp = DateTime.fromISO(response.timestamp);

    for (const message of buffer) {
      if (DateTime.fromISO(message.timestamp) > lastTimestamp) {
        await subscribe.handler(message);
      }
    }

    socket.on(subscribe.eventType, subscribe.handler);
  }

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    async function onConnect() {
      setWebSocketConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on('upgrade', (transport) => {
        setTransport(transport.name);
      });

      await subscribeAndGet({
        subscribe: {
          eventType: MatchUpdatedEvent.messageType,
          handler: onMatchUpdated,
        },
        get: {
          message: new GetMatchStatusMessage(series),
          handler: onMatchStatus,
        },
      });
    }

    function onDisconnect() {
      setWebSocketConnected(false);
      setTransport('N/A');
    }

    function handleMatchState(
      state: string,
      startTime: string,
      winner: string,
    ) {
      if (startTime) {
        const dt = DateTime.fromISO(startTime);
        setStartTime(dt);
      }

      if (state === 'pendingStart') {
        setMatchStatus('pending');
      }

      if (state === 'bettingOpen') {
        setMatchStatus('bets');
      }

      if (state === 'matchInProgress') {
        setMatchStatus('started');
      }

      if (state === 'matchFinished') {
        setWinner(winner);
        setMatchStatus('completed');
      }
    }

    async function onMatchUpdated(data: MatchUpdatedEvent) {
      const { state, startTime, winner } = data;

      handleMatchState(state, startTime, winner);
    }

    async function onMatchStatus(data: any) {
      console.log('Match status', data);
      const { state, startTime, bets, outcome } = data;

      handleMatchState(state, startTime, outcome);

      if (bets) {
        setBets(bets);
      }
    }

    function onBetPlaced(data: BetPlacedEvent) {
      const { walletAddress, amount, fighter } = data;
      setBets((prev) => [
        ...prev,
        { walletAddress, amount: parseInt(amount), fighter },
      ]);
    }

    function onBalanceUpdated(data: BalanceUpdatedEvent) {
      setBalance(parseInt(data.balance));
    }

    function onActivityStream(data: ActivityStreamEvent) {
      setActivityStream((previousItems) => {
        const items = [...previousItems, data];
        // Sort by timestamp (lexicographically, thanks to ISO 8601)
        items.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

        // We only want the last 50 items, if there are more than 50 in the array
        if (items.length > 50) {
          return items.slice(-50);
        }

        return items;
      });
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on(BalanceUpdatedEvent.messageType, onBalanceUpdated);
    socket.on(BetPlacedEvent.messageType, onBetPlaced);
    socket.on(ActivityStreamEvent.messageType, onActivityStream);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(BalanceUpdatedEvent.messageType, onBalanceUpdated);
      socket.off(BetPlacedEvent.messageType, onBetPlaced);
      socket.off(ActivityStreamEvent.messageType, onActivityStream);
    };
  }, []);

  const roundedBalance = useMemo(() => {
    // Balance rounded to 2 decimal places
    const bal = Math.round(balance * 100) / 100;
    return bal < 0 ? 1 : bal;
  }, [balance]);

  const getBalance = async () => {
    const response = await sendMessage(socket, new GetBalanceMessage());
    console.log('Balance response', response.balance);
    setBalance(response.balance);
  };

  const placeBet = async () => {
    try {
      await sendMessage(
        socket,
        new PlaceBetMessage(series, betAmount, fighter.toLowerCase()),
      );
    } catch (err: any) {
      toast({
        title: 'Cannot place bet',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.log('Error', err.message);
    }
  };

  useEffect(() => {
    controls
      .start({
        scale: 1.3,
        transition: { duration: 0.05 },
      })
      .then(() => {
        controls.start({ scale: 1 });
      });
  }, [balance, controls]);

  useEffect(() => {
    if (isAuthenticated) {
      getBalance();
    }
  }, [isAuthenticated]);

  return (
    <main className={styles.main}>
      <Container maxW="container.xl">
        <Grid
          templateAreas={`"header header header"
                  "book stream messages"
                  "book controls messages"
                  "footer footer footer"`}
          gridTemplateRows={'80px 1fr 0.5fr 100%'}
          gridTemplateColumns={'250px 1fr 250px'}
          h="100vh"
          gap="1"
          color="blackAlpha.700"
          fontWeight="bold"
        >
          <GridItem pt="20px" area={'header'}>
            <HStack justifyContent="space-between">
              <Box>
                <Image src="/logo.jpg" alt="Brawlers" width={150} height={50} />
              </Box>
              <HStack>
                <Box
                  bgColor="whiteAlpha.200"
                  px="10px"
                  py="8px"
                  borderRadius="10px"
                  color="white"
                  fontWeight="normal"
                >
                  <HStack>
                    <Button isDisabled={true} size="xs">
                      Cashier
                    </Button>
                    <motion.div animate={controls}>
                      <Box fontSize="small">
                        Points: <span>{roundedBalance}</span>
                      </Box>
                    </motion.div>
                  </HStack>
                </Box>
                <ConnectKitButton />
              </HStack>
            </HStack>
          </GridItem>
          <GridItem pl="2" bg="blackAlpha.600" area={'book'} color="white">
            <HStack textAlign="center" justifyContent="center" gap="0">
              <Box
                borderRightWidth="1px"
                borderRightStyle="solid"
                borderRightColor="whiteAlpha.400"
                flex="1"
                py="10px"
              >
                <Heading size="md">Pepe</Heading>
                <Box mt="5px">
                  {bets
                    .filter((x) => x.fighter === 'pepe')
                    .map((x) => x.amount)
                    .reduce((prev, curr) => prev + curr, 0)}{' '}
                </Box>
              </Box>
              <Box
                borderLeftWidth="1px"
                borderLeftStyle="solid"
                borderLeftColor="whiteAlpha.400"
                flex="1"
                py="10px"
              >
                <Heading size="md">Doge</Heading>
                <Box mt="5px">
                  {bets
                    .filter((x) => x.fighter === 'doge')
                    .map((x) => x.amount)
                    .reduce((prev, curr) => prev + curr, 0)}{' '}
                </Box>
              </Box>
            </HStack>
            <HStack textAlign="center" alignItems="flex-start" fontSize="14px">
              <Box width="100%">
                {bets
                  .filter((x) => x.fighter === 'pepe')
                  .map((bet, i) => (
                    <HStack key={i} justifyContent="space-between">
                      <Box>{shortenWalletAddress(bet.walletAddress)}</Box>
                      <Box>{bet.amount.toString()}</Box>
                    </HStack>
                  ))}
              </Box>
              <Box width="100%">
                {bets
                  .filter((x) => x.fighter === 'doge')
                  .map((bet, i) => (
                    <HStack key={i} justifyContent="space-between">
                      <Box>{shortenWalletAddress(bet.walletAddress)}</Box>
                      <Box>{bet.amount.toString()}</Box>
                    </HStack>
                  ))}
              </Box>
            </HStack>
          </GridItem>

          <GridItem bg="black" area={'stream'} position="relative">
            <Center
              position="absolute"
              top="0"
              left="0"
              right="0"
              bgColor="blackAlpha.600"
              py="10px"
              px="10px"
            >
              <HStack
                width="100%"
                gap="40px"
                justifyContent={
                  matchStatus === 'bets' ? 'center' : 'space-between'
                }
              >
                <Box>
                  <Image src="/pepe.jpg" alt="Pepe" width={64} height={64} />
                </Box>
                {matchStatus === 'bets' && <Box color="white">vs</Box>}
                <Box>
                  <Image src="/doge.jpg" alt="Doge" width={64} height={64} />
                </Box>
              </HStack>
            </Center>
            <iframe
              src="https://viewer.millicast.com?streamId=WBYdQB/brawlers-dev-2&controls=false&showLabels=false"
              allowFullScreen
              width="100%"
              height="480"
            ></iframe>
            {matchStatus === 'bets' && (
              <Box
                position="absolute"
                left="50%"
                right="50%"
                top="50%"
                bottom="50%"
                width="400px"
                fontSize="32px"
                fontWeight="bold"
                color="white"
                marginLeft="-200px"
                textAlign="center"
              >
                Fight starts in {startsIn}
              </Box>
            )}
            {matchStatus === 'completed' && (
              <Box
                position="absolute"
                left="50%"
                right="50%"
                top="50%"
                bottom="50%"
                width="400px"
                fontSize="32px"
                fontWeight="bold"
                color="white"
                marginLeft="-200px"
                textAlign="center"
              >
                {winner} wins!
              </Box>
            )}
          </GridItem>

          <GridItem
            pb="40px"
            bg="green.300"
            area={'controls'}
            bgColor="gray.700"
            color="white"
            position="relative"
          >
            <Center mt="-10px" mb="20px">
              <HStack gap="30px">
                <Box
                  px="20px"
                  py="10px"
                  bgColor="gray.800"
                  borderRadius="2px"
                  color="white"
                >
                  {matchStatus === 'pending' && 'Match starting soon'}
                  {matchStatus === 'bets' && 'Bets are open'}
                  {matchStatus === 'started' && 'Match in progress'}
                  {matchStatus === 'completed' && 'Match completed'}
                </Box>
                {matchStatus === 'bets' && (
                  <Box
                    px="20px"
                    py="10px"
                    bgColor="gray.800"
                    borderRadius="2px"
                    color="white"
                  >
                    {startsIn}
                  </Box>
                )}
              </HStack>
            </Center>

            <SimpleGrid columns={2} spacing={5}>
              <Box px="20px">
                <Box mb="10px">Choose a fighter</Box>

                <FighterSelector
                  fighter1={{ name: 'Pepe', image: '/pepe.jpg' }}
                  fighter2={{ name: 'Doge', image: '/doge.jpg' }}
                  onChange={(val) => setFighter(val)}
                />
              </Box>
              <Stack px="20px">
                <Box mb="10px">Choose a bet amount</Box>
                <Slider
                  aria-label="slider-ex-1"
                  defaultValue={20}
                  min={1}
                  max={roundedBalance}
                  onChange={(value) => setBetAmount(value)}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <HStack justifyContent="space-between">
                  <Box>Bet amount:</Box>
                  <Box>{betAmount}</Box>
                </HStack>
                <HStack justifyContent="space-between">
                  <Box>Max payout:</Box>
                  <Box>{betAmount * 5}</Box>
                </HStack>

                {isAuthenticated && (
                  <Button onClick={placeBet}>Place bet</Button>
                )}
                {!isAuthenticated && (
                  <Button onClick={authenticate}>Log in to place a bet</Button>
                )}
              </Stack>
            </SimpleGrid>
          </GridItem>

          <GridItem
            pl="2"
            bg="blackAlpha.600"
            area={'messages'}
            color="whiteAlpha.700"
            fontWeight="normal"
          >
            <h3>Activity stream</h3>

            {activityStream.map((item, i) => (
              <Box key={i} py="10px" borderBottom="1px solid white">
                <Box>{item.message}</Box>
              </Box>
            ))}
          </GridItem>
          <GridItem area={'footer'}></GridItem>
        </Grid>
      </Container>
    </main>
  );
}
