#!/usr/bin/env node

const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8080/game-server');

const readyPayload = {
  serverId: 'mock001',
  type: 'ready',
  version: '0.0.1',
  capabilities: {
    levels: ['level001', 'level002'],
    finishingMoves: [
      'TDA_Uppercut',
      'TDA_Suplex',
      'TDA_RoundKick',
      'TDA_MultiSmash',
      'TDA_Legsweep',
      'TDA_FlyingScissor',
      'TDA_FlyingElbow',
      'TDA_Facepunch',
      'TDA_Dropkick',
      'TDA_Discombobulate',
      'KDA_Punches',
      'KDA_JumpKick',
      'KDA_Headbutts',
    ],
    models: {
      head: ['H_PepeA', 'H_BrawlerA', 'H_BrawlerB', 'H_BrawlerC', 'H_DogeA'],
      torso: ['T_PepeA', 'T_BrawlerA', 'T_BrawlerB', 'T_BrawlerC', 'T_DogeA'],
      legs: ['L_PepeA', 'L_BrawlerA', 'L_BrawlerB', 'L_BrawlerC', 'L_DogeA'],
    },
  },
};

const matchFinishedPayload = {
  type: 'matchFinished',
};

ws.on('open', function open() {
  ws.send(JSON.stringify(readyPayload));
});

ws.on('message', function incoming(data) {
  const msg = JSON.parse(data);

  console.log('Got message', data.toString());

  if (msg.type !== 'ok') {
    const { messageId } = msg;
    ws.send(JSON.stringify({ type: 'ok', messageId }));
  }

  if (msg.type === 'matchOutcome') {
    // Schedule a match finished message
    setTimeout(() => {
      console.log("Sending 'match finished' payload");
      ws.send(JSON.stringify(matchFinishedPayload));
    }, 20_000);
  }
});
