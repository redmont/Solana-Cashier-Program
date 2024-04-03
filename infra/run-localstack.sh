#!/bin/bash

# Run checks
if [ ! -f local.tfvars ]; then
    echo "Error: local.tfvars file not found. Please create it by copying local.tfvars.example"
    exit 1
fi

parentDir=$(dirname $(pwd))

# Stop localstack
localstack stop

# Have to remove TF state, due to a bug re. ECS task definitions
rm -rf terraform.tfstate

# Start localstack
LOCALSTACK_API_KEY=4LbT16be4g \
    DYNAMODB_SHARE_DB=1 \
    EXTRA_CORS_ALLOWED_ORIGINS="http://localhost:3000" \
    DISABLE_CORS_CHECKS="1" \
    DISABLE_CORS_HEADERS="0" \
    DISABLE_CUSTOM_CORS_APIGATEWAY="1" \
    ECS_REMOVE_CONTAINERS="0" \
    IMAGE_NAME="localstack/localstack-pro:latest" \
    localstack start -d

tflocal init -reconfigure

tflocal apply -var-file="local.tfvars" -var "root_dir=$parentDir" -auto-approve
