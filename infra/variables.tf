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

variable "pubnub_publish_key" {
  description = "PubNub publish key"
  type        = string
}

variable "pubnub_subscribe_key" {
  description = "PubNub subscribe key"
  type        = string
}

variable "pubnub_secret_key" {
  description = "PubNub secret key"
  type        = string
}

variable "zealy_webhook_secret" {
  description = "Zealy webhook secret"
  type        = string
}
