resource "aws_dynamodb_table" "cashier_events_table" {
  name         = "${local.prefix}-cashier-events-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "aggregateId"
  range_key    = "version"

  attribute {
    name = "aggregateId"
    type = "S"
  }

  attribute {
    name = "version"
    type = "N"
  }

  attribute {
    name = "eventStoreId"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  global_secondary_index {
    name            = "initialEvents"
    hash_key        = "eventStoreId"
    range_key       = "timestamp"
    projection_type = "KEYS_ONLY"
  }
}

resource "aws_dynamodb_table" "cashier_read_model_table" {
  name         = "${local.prefix}-cashier-read-model-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }
}

resource "aws_dynamodb_table" "match_manager_table" {
  name         = "${local.prefix}-match-manager-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }
}

resource "aws_dynamodb_table" "ui_gateway_table" {
  name         = "${local.prefix}-ui-gateway-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }
}
