variable "lambda_dir" {
  description = "Directory containing the lambda code"
  type        = string
}

variable "filename" {
  description = "Filename"
  type        = string
}

variable "prefix" {
  description = "Prefix for resources"
  type        = string
}

variable "name" {
  description = "Function name"
  type        = string
}

variable "assume_apigw_role" {
  description = "Whether to assume the API Gateway role"
  type        = bool
  default     = false
}


variable "environment" {
  description = "Environment suffix"
  type        = string
}

variable "timeout" {
  description = "Function timeout"
  type        = number
  default     = 60
}

variable "memory_size" {
  description = "Function memory limit"
  type        = number
  default     = 128
}


variable "env_variables" {
  description = "Environment variables"
  type        = map(string)
  default     = {}
}

variable "vpc_config" {
  description = "Optional VPC configuration for the function"
  type = object({
    security_group_ids = list(string)
    subnet_ids         = list(string)
  })
  default = null
}

variable "architecture" {
  description = "Optional architecture for the function"
  type        = string
  default     = null
}
