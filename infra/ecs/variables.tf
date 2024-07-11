variable "root_dir" {
  description = "Root directory"
  type        = string
}

variable "prefix" {
  description = "Prefix for resources"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "vpc_cidr_block" {
  description = "VPC CIDR block"
  type        = string
}

variable "vpc_private_subnets" {
  description = "Private subnets"
  type        = list(string)
}

variable "redis_host" {
  description = "Redis host"
  type        = string
}

variable "redis_port" {
  description = "Redis port"
  type        = string
}

variable "lb_arn" {
  description = "Load balancer ARN"
  type        = string
}

variable "ui_gateway_table_name" {
  description = "UI Gateway table name"
  type        = string
}

variable "ui_gateway_table_arn" {
  description = "UI Gateway table ARN"
  type        = string
}

variable "core_table_name" {
  description = "Core table name"
  type        = string
}

variable "core_table_arn" {
  description = "Core table ARN"
  type        = string
}

variable "query_store_table_name" {
  description = "Query store table name"
  type        = string
}

variable "query_store_table_arn" {
  description = "Query store table ARN"
  type        = string
}

variable "oracle_indexer_table_name" {
  description = "Oracle indexer table name"
  type        = string
}

variable "oracle_indexer_table_arn" {
  description = "Oracle indexer table ARN"
  type        = string
}

variable "cashier_read_model_table_name" {
  description = "Cashier read model table name"
  type        = string
}

variable "cashier_read_model_table_arn" {
  description = "Cashier read model table ARN"
  type        = string
}

variable "cashier_events_table_name" {
  description = "Cashier events table name"
  type        = string
}

variable "cashier_events_table_arn" {
  description = "Cashier events table ARN"
  type        = string
}

variable "service_discovery_namespace_id" {
  description = "Service discovery namespace ID"
  type        = string
}

variable "service_discovery_namespace_arn" {
  description = "Service discovery namespace ARN"
  type        = string
}

variable "media_library_bucket_arn" {
  description = "Media library bucket ARN"
  type        = string
}

variable "media_library_bucket_name" {
  description = "Media library bucket name"
  type        = string
}

variable "public_assets_hostname" {
  description = "Public assets hostname"
  type        = string
}

variable "dynamic_public_key" {
  description = "Dynamic.xyz public key"
  type        = string
}

variable "millicast_api_secret" {
  description = "Millicast API secret"
  type        = string
}

variable "millicast_stream_name" {
  description = "Millicast stream name"
  type        = string
}

variable "millicast_parent_subscribe_token" {
  description = "Millicast parent subscribe token"
  type        = string
}

variable "millicast_parent_subscribe_token_id" {
  description = "Millicast parent subscribe token ID"
  type        = string
}

variable "millicast_allowed_origins" {
  description = "Millicast allowed origins"
  type        = string
}

variable "cors_origins" {
  description = "CORS origins"
  type        = list(string)
}

variable "stream_auth_parent_token_id" {
  description = "Stream authentication parent token ID"
  type        = string
}

variable "stream_auth_parent_token_secret" {
  description = "Stream authentication parent token secret"
  type        = string
}
