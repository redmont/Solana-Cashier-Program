# Database schema

## core

| schema name            | pk                                      | sk                           |
| ---------------------- | --------------------------------------- | ---------------------------- |
| bet                    | bet#(matchId)                           | (betId)                      |
| dailyClaimStatus       | dailyClaimStatus                        | (userId)                     |
| dailyClaimAmounts      | dailyClaimAmounts                       | dailyClaimAmounts            |
| fighterProfile         | fighterProfile                          | (codeName)                   |
| gameServerCapabilities | gameServerCapabilities                  | gameServerCapabilities       |
| gameServerConfig       | gameServerConfig                        | (serverId)                   |
| match                  | match                                   | (startTime)#(seriesCodeName) |
| media                  | media#(path)                            | (name)                       |
| roster                 | roster                                  | roster                       |
| series                 | series                                  | (codeName)                   |
| tournament             | tournament                              | (codeName)                   |
| tournamentEntry        | tournamentEntry#(tournamentCodeName)    | (userId)                     |
| tournamentWinnings     | tournamentWinnings#(tournamentCodeName) | (userId)#(timestamp)         |
| user                   | user#(userId)                           | user                         |
| userMatch              | match#(userId)                          | (startTime)#(seriesCodeName) |
| userMatchResult        | userMatchResult#(matchId)               | (userId)                     |
| userWallet             | wallet#(walletAddress)                  | (userId)                     |
