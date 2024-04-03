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
