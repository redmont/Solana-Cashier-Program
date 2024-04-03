"use client";

import Image from "next/image";
import styles from "./page.module.css";
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
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";

import { DateTime } from "luxon";
import { ConnectKitButton } from "connectkit";
import { motion, useAnimation } from "framer-motion";
import {
  PlaceBetMessage,
  GetBalanceMessage,
  GetStatusMessage,
} from "ui-gateway-messages";
import { sendMessage, socket } from "../socket";
import { FighterSelector } from "../components/FighterSelector";
import { useAuth } from "../components/AuthContextProvider";
import { shortenWalletAddress } from "../utils";

export default function Page(): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { tokenIsValid, authenticate, authToken } = useAuth();
  const [balance, setBalance] = useState(0);

  const [fighter, setFighter] = useState("");
  const [isWebSocketConnected, setWebSocketConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [matchStatus, setMatchStatus] = useState<
    "bets" | "started" | "completed"
  >("bets");
  const [betAmount, setBetAmount] = useState(20);
  const [bets, setBets] = useState<
    { walletAddress: string; amount: number; fighter: string }[]
  >([]);
  const [startTime, setStartTime] = useState<DateTime | undefined>();
  const [winner, setWinner] = useState("");
  const [startsIn, setStartsIn] = useState("");
  const controls = useAnimation();

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
        setStartsIn(diff.toFormat("m:ss"));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [startTime]);

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setWebSocketConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });

      sendMessage(socket, GetStatusMessage).then((response) => {
        console.log("Status response", response);
        if (response.bets) {
          setBets(response.bets);
        }
        if (response.startTime) {
          const dt = DateTime.fromISO(response.startTime);
          setStartTime(dt);
        }
        if (response.state) {
        }
        console.log(response);

        onMatchStatus(response);
      });

      getBalance();
    }

    function onDisconnect() {
      setWebSocketConnected(false);
      setTransport("N/A");
    }

    function onMatchStatus(data: any) {
      console.log("Match status", data);
      const { state, startTime, bets, outcome } = data;

      setBets(bets);

      if (state === "AcceptingBets") {
        const dt = DateTime.fromISO(startTime);
        setStartTime(dt);
        setMatchStatus("bets");
      }

      if (state === "InProgress") {
        setMatchStatus("started");
      }

      if (state === "Completed") {
        setWinner(outcome);
        setMatchStatus("completed");
      }
    }

    function onBets(bets: any) {
      console.log("onBets", bets);
      if (bets) {
        setBets(bets);
      }
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("matchStatus", onMatchStatus);
    socket.on("bets", onBets);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("matchStatus", onMatchStatus);
      socket.off("bets", onBets);
    };
  }, []);

  const roundedBalance = useMemo(() => {
    // Balance rounded to 2 decimal places
    return Math.round(balance * 100) / 100;
  }, [balance]);

  const getBalance = async () => {
    const response = await sendMessage(socket, GetBalanceMessage);
    console.log("Balance response", response);
    setBalance(response.balance);
  };

  const placeBet = async () => {
    await sendMessage(socket, PlaceBetMessage, betAmount, fighter);

    getBalance();
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

  return (
    <main className={styles.main}>
      <Container maxW="container.xl">
        <Grid
          templateAreas={`"header header header"
                  "book stream messages"
                  "book controls messages"
                  "footer footer footer"`}
          gridTemplateRows={"80px 1fr 0.5fr 100%"}
          gridTemplateColumns={"250px 1fr 250px"}
          h="100vh"
          gap="1"
          color="blackAlpha.700"
          fontWeight="bold"
        >
          <GridItem pt="20px" area={"header"}>
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
          <GridItem pl="2" bg="blackAlpha.600" area={"book"} color="white">
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
                    .filter((x) => x.fighter === "Pepe")
                    .map((x) => x.amount)
                    .reduce((prev, curr) => prev + curr, 0)}{" "}
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
                    .filter((x) => x.fighter === "Doge")
                    .map((x) => x.amount)
                    .reduce((prev, curr) => prev + curr, 0)}{" "}
                </Box>
              </Box>
            </HStack>
            <HStack textAlign="center" alignItems="flex-start" fontSize="14px">
              <Box width="100%">
                {bets
                  .filter((x) => x.fighter === "Pepe")
                  .map((bet, i) => (
                    <HStack key={i} justifyContent="space-between">
                      <Box>{shortenWalletAddress(bet.walletAddress)}</Box>
                      <Box>{bet.amount.toString()}</Box>
                    </HStack>
                  ))}
              </Box>
              <Box width="100%">
                {bets
                  .filter((x) => x.fighter === "Doge")
                  .map((bet, i) => (
                    <HStack key={i} justifyContent="space-between">
                      <Box>{shortenWalletAddress(bet.walletAddress)}</Box>
                      <Box>{bet.amount.toString()}</Box>
                    </HStack>
                  ))}
              </Box>
            </HStack>
          </GridItem>

          <GridItem bg="black" area={"stream"} position="relative">
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
                  matchStatus === "bets" ? "center" : "space-between"
                }
              >
                <Box>
                  <Image src="/pepe.jpg" alt="Pepe" width={64} height={64} />
                </Box>
                {matchStatus === "bets" && <Box color="white">vs</Box>}
                <Box>
                  <Image src="/doge.jpg" alt="Doge" width={64} height={64} />
                </Box>
              </HStack>
            </Center>
            <video
              src={matchStatus === "bets" ? "/game_idle.mp4" : "/game_play.mp4"}
              height="100%"
              autoPlay
              loop={matchStatus === "bets"}
              muted
            />
            {matchStatus === "bets" && (
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
            {matchStatus === "completed" && (
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
            area={"controls"}
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
                  {matchStatus === "bets" && "Bets are open"}
                  {matchStatus === "started" && "Match in progress"}
                  {matchStatus === "completed" && "Match completed"}
                </Box>
                {matchStatus === "bets" && (
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
                  fighter1={{ name: "Pepe", image: "/pepe.jpg" }}
                  fighter2={{ name: "Doge", image: "/doge.jpg" }}
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
                <Button onClick={getBalance}>Get balance</Button>
              </Stack>
            </SimpleGrid>
          </GridItem>

          <GridItem
            pl="2"
            bg="blackAlpha.600"
            area={"messages"}
            color="whiteAlpha.700"
            fontWeight="normal"
            fontFamily="monospace"
          ></GridItem>
          <GridItem area={"footer"}></GridItem>
        </Grid>
      </Container>
    </main>
  );
}
