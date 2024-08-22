# Cashier module (lambda functions)

## Test locally

Make sure you have NATS running locally.

```sh
# Build
pnpm build

# Start local lambda server
pnpm start

# Now use ngrok to expose the lambda server
ngrok http 8008

# You can now point an Alchemy webhook to the ngrok URL

# Alternatively, you can use curl to test the lambda
curl -X POST http://localhost:8008/webhookListener -H 'Content-Type: application/json' -d '{ "event": { "data": { "block": { "logs": [ ] } } } }'
```

## Alchemy webhook

Set up a GraphQL webhook with the query below.  
The `addresses` array refers to the smart contract that emits the event.

```
{
  block {
    logs(filter: {addresses: ["0x8392875ed1cbd17f3bd723e361f4af7d7b3b0ec4"], topics: ["0xe0f1c194717590480e51c809e7cbeef1245ccfd1fe3501495bd2e715549ef2b5"]}) {
      transaction {
        hash
        index
        from {
          address
        }
        to {
          address
        }
        logs {
          topics
          data
        }
        type
        status
      }
    }
  }
}
```
