variable "prefix" {
  description = "Prefix for resources"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "node_ids" {
  type    = list(string)
  default = ["n1-c1", "n2-c1", "n3-c1"]
}

variable "vpc_private_subnets" {
  type = list(string)
}

variable "service_discovery_namespace_arn" {
  type = string
}

variable "ecs_tasks_execution_role_arn" {
  type = string
}

variable "cloudwatch_log_group_name" {
  type = string
}

variable "ecs_cluster_id" {
  type = string
}

variable "task_sg_id" {
  type = string
}
