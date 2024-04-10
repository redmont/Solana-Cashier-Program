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

variable "match_manager_table_name" {
  description = "Match Manager table name"
  type        = string
}

variable "match_manager_table_arn" {
  description = "Match Manager table ARN"
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
