DYNAMODB_CONTAINER_NAME="brawlers-db"

if [ $(docker ps -a -f name=$DYNAMODB_CONTAINER_NAME --format "{{.Names}}") = $DYNAMODB_CONTAINER_NAME ]; then
    echo "Container $DYNAMODB_CONTAINER_NAME exists. Checking status..."
    if [ "$(docker inspect -f '{{.State.Status}}' $DYNAMODB_CONTAINER_NAME)" = "exited" ]; then
        echo "Restarting $DYNAMODB_CONTAINER_NAME..."
        docker start $DYNAMODB_CONTAINER_NAME
    fi
else
    echo "Creating and starting new $DYNAMODB_CONTAINER_NAME..."
    docker run --name $DYNAMODB_CONTAINER_NAME -p 8765:8765 amazon/dynamodb-local -jar DynamoDBLocal.jar -port 8765 -inMemory -sharedDb &
fi

# run Redis
docker run -p 4515:6379 -d --rm redis &

REDIS_PID=$!

# run NATS
docker run -d -p 4222:4222 -p 6222:6222 -p 8222:8222 --rm nats

NATS_PID=$!

cleanup() {
    echo "Stopping DynamoDB Local..."
    docker stop $DYNAMODB_CONTAINER_NAME &>/dev/null
    echo "Stopping Redis..."
    docker stop $(docker ps -q --filter ancestor=redis) &>/dev/null
    echo "Stopping NATS..."
    docker stop $(docker ps -q --filter ancestor=nats) &>/dev/null
}

trap cleanup INT

sleep 5

aws dynamodb create-table \
    --table-name cashier-events-local \
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
