terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    key    = "state"
    region = "ap-southeast-1"
  }
}

provider "aws" {
  region = local.aws_region
}

provider "aws" {
  region = "us-east-1"
  alias  = "us_east_1"
}

module "vpc" {
  source                 = "terraform-aws-modules/vpc/aws"
  name                   = "${local.prefix}-vpc-${var.environment}"
  cidr                   = local.vpc_cidr
  azs                    = ["${local.aws_region}a", "${local.aws_region}b", "${local.aws_region}c"]
  private_subnets        = local.private_subnets
  public_subnets         = local.public_subnets
  enable_nat_gateway     = true
  single_nat_gateway     = false
  one_nat_gateway_per_az = true
  enable_vpn_gateway     = false
  enable_dns_hostnames   = true
  enable_dns_support     = true
}

module "ecs" {
  source      = "./ecs"
  root_dir    = var.root_dir
  prefix      = local.prefix
  environment = var.environment

  vpc_id              = module.vpc.vpc_id
  vpc_cidr_block      = module.vpc.vpc_cidr_block
  vpc_private_subnets = module.vpc.private_subnets

  redis_host = module.elasticache.cluster_cache_nodes.0.address
  redis_port = local.redis_port

  lb_arn = aws_alb.lb.arn

  ui_gateway_image_tag = var.ui_gateway_image_tag
  core_image_tag       = var.core_image_tag
  cashier_image_tag    = var.cashier_image_tag

  ui_gateway_table_name         = aws_dynamodb_table.ui_gateway_table.name
  ui_gateway_table_arn          = aws_dynamodb_table.ui_gateway_table.arn
  core_table_name               = aws_dynamodb_table.core_table.name
  core_table_arn                = aws_dynamodb_table.core_table.arn
  query_store_table_name        = aws_dynamodb_table.query_store_table.name
  query_store_table_arn         = aws_dynamodb_table.query_store_table.arn
  cashier_read_model_table_name = aws_dynamodb_table.cashier_read_model_table.name
  cashier_read_model_table_arn  = aws_dynamodb_table.cashier_read_model_table.arn
  cashier_events_table_name     = aws_dynamodb_table.cashier_events_table.name
  cashier_events_table_arn      = aws_dynamodb_table.cashier_events_table.arn
  oracle_indexer_table_name     = var.environment == "dev" ? "brawl-oracle-indexer-dev" : "brawl-oracle-indexer-prod"
  oracle_indexer_table_arn      = var.environment == "dev" ? "arn:aws:dynamodb:ap-southeast-1:875278257729:table/brawl-oracle-indexer-dev" : "arn:aws:dynamodb:ap-southeast-1:767397714894:table/brawl-oracle-indexer-prod"

  service_discovery_namespace_id  = aws_service_discovery_private_dns_namespace.discovery_namespace.id
  service_discovery_namespace_arn = aws_service_discovery_private_dns_namespace.discovery_namespace.arn

  media_library_bucket_arn  = aws_s3_bucket.public_assets_bucket.arn
  media_library_bucket_name = aws_s3_bucket.public_assets_bucket.bucket

  public_assets_hostname = var.public_assets_hostname

  dynamic_public_key = var.dynamic_public_key

  cors_origins = var.cors_origins

  stream_auth_parent_token_id     = var.stream_auth_parent_token_id
  stream_auth_parent_token_secret = var.stream_auth_parent_token_secret

  pubnub_publish_key   = var.pubnub_publish_key
  pubnub_subscribe_key = var.pubnub_subscribe_key
  pubnub_secret_key    = var.pubnub_secret_key

  withdrawal_signer_kms_key_arn = aws_kms_key.withdrawal_signer_key.arn
  withdrawal_signer_kms_key_id  = aws_kms_key.withdrawal_signer_key.key_id
}
