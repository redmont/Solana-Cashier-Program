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

  attribute {
    name = "primaryWalletAddress"
    type = "S"
  }

  attribute {
    name = "balance"
    type = "N"
  }

  global_secondary_index {
    name            = "primaryWalletAddress"
    hash_key        = "primaryWalletAddress"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "pkBalance"
    hash_key        = "pk"
    range_key       = "balance"
    projection_type = "ALL"
  }
}

resource "aws_dynamodb_table" "core_table" {
  name         = "${local.prefix}-core-${var.environment}"
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

  attribute {
    name = "startDate"
    type = "S"
  }

  global_secondary_index {
    name            = "pkStartDate"
    hash_key        = "pk"
    range_key       = "startDate"
    projection_type = "INCLUDE"
    non_key_attributes = [
      "sk",
      "displayName",
      "description",
      "startDate",
      "endDate",
      "prizes",
    ]
  }
}

resource "aws_dynamodb_table" "query_store_table" {
  name         = "${local.prefix}-query-store-${var.environment}"
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

  attribute {
    name = "startDate"
    type = "S"
  }

  attribute {
    name = "tournamentEntryWinAmount"
    type = "N"
  }

  global_secondary_index {
    name            = "pkStartDate"
    hash_key        = "pk"
    range_key       = "startDate"
    projection_type = "INCLUDE"
    non_key_attributes = [
      "sk",
      "displayName",
      "description",
      "startDate",
      "endDate",
      "prizes",
    ]
  }

  global_secondary_index {
    name            = "pkTournamentEntryWinAmount"
    hash_key        = "pk"
    range_key       = "tournamentEntryWinAmount"
    projection_type = "INCLUDE"
    non_key_attributes = [
      "sk",
      "primaryWalletAddress",
      "tournamentEntryWinAmount",
      "balance",
    ]
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

resource "aws_s3_bucket" "stream_assets_bucket" {
  bucket = "${local.prefix}-stream-assets-${var.environment}"
}


