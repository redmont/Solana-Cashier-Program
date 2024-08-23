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
    name = "createdAt"
    type = "S"
  }

  attribute {
    name = "startDate"
    type = "S"
  }

  attribute {
    name = "userId"
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

  global_secondary_index {
    name            = "pkCreatedAt"
    hash_key        = "pk"
    range_key       = "createdAt"
    projection_type = "INCLUDE"
    non_key_attributes = [
      "sk",
      "userId",
      "winAmount"
    ]
  }

  global_secondary_index {
    name            = "skUserId"
    hash_key        = "sk"
    range_key       = "userId"
    projection_type = "KEYS_ONLY"
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

  attribute {
    name = "xp"
    type = "N"
  }

  attribute {
    name = "matchFighters"
    type = "S"
  }

  attribute {
    name = "startTime"
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
      "currentRound",
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
      "xp"
    ]
  }

  global_secondary_index {
    name            = "pkTournamentEntryXp"
    hash_key        = "pk"
    range_key       = "xp"
    projection_type = "INCLUDE"
    non_key_attributes = [
      "sk",
      "primaryWalletAddress",
      "tournamentEntryWinAmount",
      "balance",
      "xp",
    ]

  }

  global_secondary_index {
    name            = "matchFightersStartTime"
    hash_key        = "matchFighters"
    range_key       = "startTime"
    projection_type = "INCLUDE"
    non_key_attributes = [
      "seriesCodeName",
      "fighters",
      "winner"
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

resource "aws_s3_bucket" "posthog_bucket" {
  bucket = "${local.prefix}-posthog-${var.environment}"
}

# Bucket policy to allow posthog lambda to access the bucket
resource "aws_s3_bucket_policy" "posthog_bucket_policy" {
  bucket = aws_s3_bucket.posthog_bucket.bucket

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = module.posthog_webhook_listener.exec_role_arn
        }
        Action   = ["s3:GetObject", "s3:PutObject"]
        Resource = ["${aws_s3_bucket.posthog_bucket.arn}/*"]
      }
    ]
  })
}
