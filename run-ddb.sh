docker run -p 8765:8765 amazon/dynamodb-local -jar DynamoDBLocal.jar -port 8765 -inMemory -sharedDb &

DYNAMODB_PID=$!

cleanup() {
  echo "Stopping DynamoDB Local..."
  docker stop $(docker ps -q --filter ancestor=amazon/dynamodb-local) &>/dev/null
}

trap cleanup INT

sleep 5

aws dynamodb create-table \
   --table-name cashier-events \
   --attribute-definitions AttributeName=aggregateId,AttributeType=S AttributeName=version,AttributeType=N AttributeName=eventStoreId,AttributeType=S AttributeName=timestamp,AttributeType=S \
   --key-schema AttributeName=aggregateId,KeyType=HASH AttributeName=version,KeyType=RANGE \
   --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=5 \
   --global-secondary-indexes \
        "[
            {
                \"IndexName\": \"initialEvents\",
                \"KeySchema\": [{\"AttributeName\":\"eventStoreId\",\"KeyType\":\"HASH\"},
                                {\"AttributeName\":\"timestamp\",\"KeyType\":\"RANGE\"}],
                \"Projection\":{
                    \"ProjectionType\":\"KEYS_ONLY\"
                },
                \"ProvisionedThroughput\": {
                    \"ReadCapacityUnits\": 10,
                    \"WriteCapacityUnits\": 5
                }
            }
        ]" \
   --endpoint-url http://localhost:8765 \
   --no-cli-pager

wait $DYNAMODB_PID