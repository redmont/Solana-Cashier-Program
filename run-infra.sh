DYNAMODB_CONTAINER_NAME="brawlers-db"

trap cleanup INT TERM EXIT

# Function to convert CSV to JSON format expected by DynamoDB
convert_to_dynamodb_json() {
    IFS=',' read -r -a array <<< "$1"
    printf '{"PutRequest":{"Item":{'
    first=true
    for index in "${!array[@]}"
    do
        if [ "$first" = true ]; then
            first=false
        else
            printf ','
        fi

        # Escape internal double quotes for strings and format properly in JSON
        value=$(echo "${array[index]}")

        #echo "Header is " ${headers[index]}

        if [[ "${headers[index]}" == "\"timestamp\"" || "${headers[index]}" == "\"confidence\"" || "${headers[index]}" == "\"price\"" ]]; then
            # These fields are numbers; we output them without internal quotes
            printf "${headers[index]}:{\"N\":%s}" "${array[index]}"
        else
            # Other fields are strings; we escape internal quotes and wrap in double quotes
            printf "${headers[index]}:{\"S\":%s}" "${value}"
        fi
    done
    printf '}}}'
}


if [ $(docker ps -a -f name=$DYNAMODB_CONTAINER_NAME --format "{{.Names}}") = $DYNAMODB_CONTAINER_NAME ]; then
    echo "Container $DYNAMODB_CONTAINER_NAME exists. Checking status..."
    if [ "$(docker inspect -f '{{.State.Status}}' $DYNAMODB_CONTAINER_NAME)" = "exited" ]; then
        echo "Restarting $DYNAMODB_CONTAINER_NAME..."
        docker start $DYNAMODB_CONTAINER_NAME
    fi
else
    echo "Creating and starting new $DYNAMODB_CONTAINER_NAME..."
    docker run --name $DYNAMODB_CONTAINER_NAME -p 8765:8765 amazon/dynamodb-local -jar DynamoDBLocal.jar -port 8765 -sharedDb &
fi

# run Redis
docker run -p 4515:6379 -d --rm redis

REDIS_PID=$!

# run NATS
docker run -d -p 4222:4222 -p 6222:6222 -p 8222:8222 --rm nats -js

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

# Check if cashier-events-local exists
aws dynamodb list-tables --endpoint-url http://localhost:8765 | grep cashier-events-local

# If it doesn't exist, create it
if [ $? -ne 0 ]; then
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
fi

# Check if oracle-indexer-local table exists
aws dynamodb list-tables --endpoint-url http://localhost:8765 | grep oracle-indexer-local

# If it doesn't exist, create it
if [ $? -ne 0 ]; then
    aws dynamodb create-table \
        --table-name oracle-indexer-local \
        --attribute-definitions AttributeName=pk,AttributeType=S AttributeName=timestamp,AttributeType=N \
        --key-schema AttributeName=pk,KeyType=HASH AttributeName=timestamp,KeyType=RANGE \
        --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=5 \
        --endpoint-url http://localhost:8765 \
        --no-cli-pager

    CSV_FILES=('sample-data-doge.csv' 'sample-data-pepe.csv')

    for CSV_FILE in "${CSV_FILES[@]}"
    do
        # Reading header and removing newline characters
        read -r header < $CSV_FILE
        header=$(echo "$header" | tr -d '\n')
        IFS=',' read -r -a headers <<< "$header"
        
        # Initialize the JSON array for batch items
        declare -a JSON_BATCH=()
        BATCH_SIZE=25

        # Processing each line, skipping the header
        tail -n +2 $CSV_FILE | while IFS= read -r line
        do
            JSON_ITEM=$(convert_to_dynamodb_json "$line")
            JSON_BATCH+=("$JSON_ITEM")

            # Check if we have collected enough items for a batch write
            if [ "${#JSON_BATCH[@]}" -eq "$BATCH_SIZE" ]; then
                JSON_PAYLOAD="{ \"oracle-indexer-local\": [ $(IFS=,; echo "${JSON_BATCH[*]}") ] }"
                aws dynamodb batch-write-item --request-items "$JSON_PAYLOAD" --endpoint-url http://localhost:8765 --no-cli-pager
                # Clear the batch array
                JSON_BATCH=()
            fi
        done

        # Handle any remaining items that didn't make up a full batch
        if [ "${#JSON_BATCH[@]}" -gt 0 ]; then
            JSON_PAYLOAD="{ \"oracle-indexer-local\": [ $(IFS=,; echo "${JSON_BATCH[*]}") ] }"
            aws dynamodb batch-write-item --request-items "$JSON_PAYLOAD" --endpoint-url http://localhost:8765 --no-cli-pager
        fi
    done
fi

echo "Done! Press CTRL+C to stop."

while true; do
    sleep 1
done