variable "root_dir" {
  description = "Root directory of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
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

variable "alchemy_webhook_signing_key" {
  description = "Alchemy webhook signing key"
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

variable "public_assets_cors_origins" {
  description = "CORS origins for public assets"
  type        = list(string)
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
